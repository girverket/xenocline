import { Context } from '../context';
import { createAggregatorNodeEvent, createPhaseNodeEvent } from '../event/node';
import { createDecisionEvent } from '../event/transition';
import { Input } from '../input';
import { AggregatorNode, isAggregatorNode } from '../node/aggregatornode';
import { isPhaseNode, PhaseNode } from '../node/phasenode';
import { Output } from '../output';
import { Connection } from '../transition/connection';
import { Decision, isDecision } from '../transition/decision';
import { Termination } from '../transition/termination';
import {
    executeAggregatorNode
} from './aggregator';
import { dispatchEvent } from './event';
import { handleNextStep } from './next';
import { executePhase } from './phase';
import { ExecutionState } from './process';

export async function executeNode(
    nodeId: string,
    input: Input,
    state: ExecutionState
): Promise<Output> {


    // 1. Check if result is already cached in phaseResults (final output, node fully completed)
    if (state.phaseResults[nodeId]) {

        return state.phaseResults[nodeId];
    }

    const node = state.process.phases[nodeId] as PhaseNode | AggregatorNode;
    if (!node) {
        const error = new Error(`Node with ID "${nodeId}" not found.`);

        state.errors.push({ nodeId, message: error.message });
        throw error;
    }


    // 2. Handle active/pending executions
    // If it's an aggregator that has a deferred promise, it means it's pending.
    // We need to re-evaluate it with the current input. The IIFE below will handle this.
    if (state.activeExecutions.has(nodeId) && !isAggregatorNode(node)) {
        // For non-aggregators, if already active, return the promise.
        // Aggregators will fall through to the IIFE to allow input processing.
        // The IIFE itself handles returning a shared deferred promise if needed.

        return state.activeExecutions.get(nodeId)!;
    }
    // If it IS an aggregator and state.activeExecutions.has(nodeId),
    // it means its deferred.promise might be in activeExecutions from a previous input that made it pending.
    // The IIFE logic below will correctly retrieve this deferred (if it exists and is still relevant)
    // from state.aggregatorDeferreds.get(nodeId) and use its promise, or process the input.


    // If it's an aggregator and it's pending (has a deferred), we fall through to re-execute its logic within the IIFE.
    // If it's the first call to any node, we fall through.

    // 3. Mark as active and execute (or re-evaluate pending aggregator)
    const executionPromise = (async (): Promise<Output> => {

        try {
            let output: Output;

            if (isAggregatorNode(node)) {

                dispatchEvent(
                    state.eventState,
                    createAggregatorNodeEvent(nodeId, 'start', node, { input }),
                    state.context
                );

                output = await executeAggregatorNode(nodeId, node, input, state);
            } else if (isPhaseNode(node)) {

                dispatchEvent(state.eventState, createPhaseNodeEvent(nodeId, 'start', node, { input }), state.context);

                if (node.prepare) {
                    const [preparedInput, preparedContext] = await node.prepare(input, state.context);
                    input = preparedInput;
                    state.context = preparedContext;
                }

                dispatchEvent(state.eventState, createPhaseNodeEvent(nodeId, 'prepared', node, { input }), state.context);


                output = await executePhase(nodeId, node, input, state);

                if (node.process) {
                    const [processedOutput, processedContext] = await node.process(output, state.context);
                    output = processedOutput;
                    state.context = processedContext;
                }

                dispatchEvent(state.eventState, createPhaseNodeEvent(nodeId, 'processed', node, { input, output }), state.context);

            } else {
                const error = new Error(`Unknown or invalid node type for ID "${nodeId}". Expected PhaseNode or AggregatorNode.`);

                throw error;
            }

            state.phaseResults[nodeId] = output; // Set final output once ready/executed


            // 4. Handle next step
            if (node.next) {

                if (Array.isArray(node.next) && node.next.length > 0 && node.next.every(isDecision)) {

                    const decisions = node.next as Decision<Output, Context>[];
                    const decisionExecutionPromises: Promise<void>[] = [];
                    for (const decision of decisions) {

                        dispatchEvent(state.eventState, createDecisionEvent(nodeId, 'start', decision, { output }), state.context);

                        const decisionPromise = (async () => {

                            try {
                                const decisionOutcome = await decision.decide(output, state.context);
                                dispatchEvent(state.eventState, createDecisionEvent(nodeId, 'decide', decision, { output, result: decisionOutcome }), state.context);

                                await handleNextStep(output, decision.id, decisionOutcome, state);
                                dispatchEvent(state.eventState, createDecisionEvent(nodeId, 'end', decision), state.context);
                            } catch (decisionError: any) {
                                const errorMessage = `Decision error on '${decision.id}' for node '${nodeId}': ${decisionError.message}`;
                                state.errors.push({
                                    nodeId: decision.id,
                                    message: errorMessage,
                                    details: { sourceNodeId: nodeId, originalError: decisionError.message }
                                });
                            }
                        })();
                        decisionExecutionPromises.push(decisionPromise);
                    }

                    await Promise.all(decisionExecutionPromises);

                } else {

                    await handleNextStep(output, nodeId, node.next as Termination<Output, Context> | Connection<Output, Context>[] | Decision<Output, Context>[], state);
                }
            } else {

                const result: Output = output;
                state.results[nodeId] = result;
            }

            if (isPhaseNode(node)) {
                dispatchEvent(state.eventState, createPhaseNodeEvent(nodeId, 'end', node, { input, output }), state.context);
            } else {
                dispatchEvent(state.eventState, createAggregatorNodeEvent(nodeId, 'end', node, { input, output }), state.context);
            }

            return output;
        } catch (error: any) {
            state.errors.push({ nodeId, message: error.message });
            // Clean up any pending aggregator deferred on error
            if (state.aggregatorDeferreds.has(nodeId)) {
                const deferred = state.aggregatorDeferreds.get(nodeId);
                if (deferred) {
                    deferred.reject(error);
                }
                state.aggregatorDeferreds.delete(nodeId);
            }
            throw error;
        } finally {

            // If a node completed (not pending via deferred mechanism) or an error occurred.
            // An aggregator that is still pending (has a deferred) should keep its promise in activeExecutions.
            if (!state.aggregatorDeferreds.has(nodeId)) {

                state.activeExecutions.delete(nodeId);
            }
        }
    })();

    // Store the promise from the IIFE.
    // If it's an aggregator that went pending, executionPromise IS deferred.promise.
    // If it's an aggregator that became ready, executionPromise is a promise resolving to its output.
    // If it's a phase node, executionPromise is a promise resolving to its output.

    state.activeExecutions.set(nodeId, executionPromise);

    return executionPromise;

}

