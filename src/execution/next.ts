import { executeNode } from './node';
import { ExecutionState } from './process';
import { Context } from '../context';
import { Input } from '../input';
import { Output } from '../output';
import { Connection, isConnection } from '../transition/connection';
import { Decision, isDecision } from '../transition/decision';
import { isTermination, Termination } from '../transition/termination';
import { dispatchEvent } from './event';
import { createConnectionEvent, createDecisionEvent, createTerminationEvent } from '../event';

// Helper function to handle the next step in the process
export async function handleNextStep(
    nodeOutput: Output,
    nodeId: string,
    next: Termination | Connection[] | Decision[], // Can be Termination, Connection[], or Decision[] - will be narrowed down
    state: ExecutionState
): Promise<void> {


    if (Array.isArray(next) && next.length > 0 && next.every(isDecision)) {
        const decisions = next as Decision<Output, Context>[];

        for (const decision of decisions) {
            await dispatchEvent(
                state.eventState,
                createDecisionEvent(nodeId, 'start', decision, { output: nodeOutput }),
                state.context
            );
            try {
                const decisionOutcome = await decision.decide(nodeOutput, state.context);
                await dispatchEvent(
                    state.eventState,
                    createDecisionEvent(nodeId, 'decide', decision, { output: nodeOutput, result: decisionOutcome }),
                    state.context
                );
                await handleNextStep(nodeOutput, decision.id, decisionOutcome, state); // outcome processed, decision.id is context for next step if it's an error source. The original nodeId is implicitly the source of this decision.
                await dispatchEvent(
                    state.eventState,
                    createDecisionEvent(nodeId, 'end', decision), // Fire 'end' event after successful processing
                    state.context
                );
            } catch (decisionError: any) {
                const errorMessage = `Decision error on '${decision.id}' from node '${nodeId}': ${decisionError.message}`;
                state.errors.push({
                    nodeId: decision.id,
                    message: errorMessage,
                    details: { sourceNodeId: nodeId, originalError: decisionError.message }
                });
            }
        }
    } else if (Array.isArray(next) && next.length > 0 && next.every(isConnection)) {

        const connections = next as Connection<Output, Context>[];
        const nextPhasePromises: Promise<Output>[] = [];
        for (const connection of connections) {

            let nextInput = nodeOutput as Input;
            let nextContext = state.context;

            await dispatchEvent(
                state.eventState,
                createConnectionEvent(nodeId, 'start', connection, { input: nextInput }),
                state.context
            );

            if (connection.transform) {

                try {
                    const context = state.context;
                    [nextInput, nextContext] = await connection.transform(nodeOutput, context);
                    await dispatchEvent(
                        state.eventState,
                        createConnectionEvent(nodeId, 'transform', connection, { input: nextInput, output: nodeOutput, context: nextContext }),
                        state.context
                    );
                    state.context = nextContext;

                } catch (transformError: any) {
                    const errorMessage = `Transform error on connection '${connection.id}' from node '${nodeId}' to '${connection.targetNodeId}': ${transformError.message}`;
                    state.errors.push({
                        nodeId: connection.id,
                        message: errorMessage,
                        details: { sourceNodeId: nodeId, targetNodeId: connection.targetNodeId, originalError: transformError.message }
                    });
                    continue;
                }
            }

            nextPhasePromises.push(executeNode(connection.targetNodeId, nextInput, state));
            await dispatchEvent(
                state.eventState,
                createConnectionEvent(nodeId, 'end', connection), // Fire 'end' event after initiating next step
                state.context
            );
        }
        // Optional: await Promise.all(nextPhasePromises); // Current design relies on executeProcess waiting on activeExecutions

    } else if (isTermination(next)) {

        const termination = next as Termination<Output, Context>;
        await dispatchEvent(
            state.eventState,
            createTerminationEvent(nodeId, 'start', termination, { output: nodeOutput }),
            state.context
        );
        let result: Output = nodeOutput;
        if (termination.terminate) {
            result = await termination.terminate(nodeOutput, state.context);
            await dispatchEvent(
                state.eventState,
                createTerminationEvent(nodeId, 'terminate', termination, { output: result }),
                state.context
            );
        }

        state.results[termination.id] = result;
    } else if (Array.isArray(next) && next.length === 0) {
        // Empty array from a Decision means no path should be taken from this node.
        // This is treated as an implicit termination, storing the result with a generated key.
        // Note: This behavior means a Decision can dynamically terminate a process path.

        const result: Output = nodeOutput;
        const implicitTerminationId = `${nodeId}_implicit_end`;
        state.results[implicitTerminationId] = result;
    } else {
        // If there is no next (e.g. next is undefined or null after a decision), or it's an unhandled type.
        // Consider this an end state and store the result with the nodeId

        const result: Output = nodeOutput;
        state.results[nodeId] = result;
    }

}
