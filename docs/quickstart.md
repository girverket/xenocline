# Quickstart Guide

This guide walks through building your first xenocline pipeline, from a simple linear flow to conditional routing and event observation.

## Installation

```bash
npm install @girverket/xenocline
```

Requirements: Node.js ≥ 24, TypeScript ≥ 5.6 recommended.

## 1. A Simple Linear Pipeline

Let's build a pipeline that takes a number, adds one, multiplies by two, and stringifies the result.

```typescript
import {
    createPhase,
    createPhaseNode,
    createConnection,
    createTermination,
    createBeginning,
    createProcess,
    executeProcess,
} from '@girverket/xenocline';

// Define phases — each takes input and returns output
const addPhase = createPhase<{ value: number }, { value: number }>('AddOne', {
    execute: async (input) => ({ value: input.value + 1 }),
});

const multiplyPhase = createPhase<{ value: number }, { value: number }>('MultiplyByTwo', {
    execute: async (input) => ({ value: input.value * 2 }),
});

const stringifyPhase = createPhase<{ value: number }, { result: string }>('Stringify', {
    execute: async (input) => ({ result: `The final number is: ${input.value}` }),
});

// Connect phases into a process
const myProcess = createProcess('MyPipeline', {
    phases: {
        add: createPhaseNode('add', addPhase, {
            next: [createConnection('add-to-multiply', 'multiply')],
        }),
        multiply: createPhaseNode('multiply', multiplyPhase, {
            next: [createConnection('multiply-to-stringify', 'stringify')],
        }),
        stringify: createPhaseNode('stringify', stringifyPhase, {
            next: createTermination('done', {
                terminate: async (output) => output,
            }),
        }),
    },
});

// Execute
const beginning = createBeginning('begin', 'add');
const [results] = await executeProcess(myProcess, beginning, {
    input: { value: 10 },
});

console.log(results['done']); // { result: 'The final number is: 22' }
```

### What just happened?

1. **Phases** are the processing units. Each has an `execute` function that transforms input to output.
2. **PhaseNodes** wrap phases and define what happens next via the `next` property.
3. **Connections** link one node to another by target node ID.
4. **Terminations** end the pipeline and store the result under a key.
5. **executeProcess** runs the pipeline and returns `[results, phaseResults, context]`.

## 2. Adding Conditional Routing

Real pipelines need to branch. Use `createDecision` to route based on data:

```typescript
import { createDecision } from '@girverket/xenocline';

const routeDecision = createDecision<{ value: number }>('RouteByValue', async (output) => {
    if (output.value > 100) {
        return [createConnection('to-big', 'bigHandler')];
    }
    return [createConnection('to-small', 'smallHandler')];
});

// Use it as a node's next:
createPhaseNode('check', checkPhase, {
    next: [routeDecision],
});
```

The `decide` function receives the phase output and returns either:
- A single `Termination` (end the pipeline)
- An array of `Connection`s (route to one or more nodes)
- An array of `Decision`s (nested decisions — rare but supported)

## 3. Observing Execution with Events

Attach event handlers to monitor what happens during execution:

```typescript
import { createEventHandler, createEventFilter, createFilteredHandler } from '@girverket/xenocline';

// Log all events
const logger = createEventHandler(async (event, context) => {
    console.log(`[${event.type}:${event.stage}] ${event.sourceId}`);
});

// Only log phase executions
const phaseFilter = createEventFilter(['phase'], ['execute']);
const phaseLogger = createFilteredHandler(phaseFilter, {
    handle: async (event, context) => {
        console.log(`Phase executed: ${event.sourceId}`);
    },
});

const [results] = await executeProcess(myProcess, beginning, {
    input: { value: 10 },
    eventHandlers: [logger, phaseLogger],
});
```

### Event types and stages

| Type | Stages |
|------|--------|
| `process` | `start`, `end` |
| `node` | `start`, `end` |
| `phase` | `execute` |
| `transition` | `start`, `end`, `terminate` |

## 4. Sharing State with Context

Pass a context object to share state across phases:

```typescript
const context = {
    userId: 'user-123',
    startTime: Date.now(),
    metrics: { phasesExecuted: 0 },
};

const [results, , returnedContext] = await executeProcess(myProcess, beginning, {
    input: { value: 10 },
    context,
});

// Phases can read and write to context during execution
```

## 5. Parallel Execution and Aggregation

When a decision returns multiple connections, the target nodes execute in parallel. Use an **aggregator** to merge their outputs:

```typescript
import { createAggregator, createAggregatorNode } from '@girverket/xenocline';

const mergeAggregator = createAggregator('MergeResults', {
    aggregate: async (input, context) => {
        // Track which branches have reported
        if (!context.mergeState) context.mergeState = { branches: {} };
        const state = context.mergeState;

        if ('fieldA' in input) state.branches.a = input;
        if ('fieldB' in input) state.branches.b = input;

        if (state.branches.a && state.branches.b) {
            return { status: 'Ready', output: { ...state.branches.a, ...state.branches.b } };
        }
        return { status: 'NotYetReady' };
    },
});

// Use in a process:
createAggregatorNode('merge', mergeAggregator, {
    next: [createConnection('merge-to-next', 'nextNode')],
}),
```

> **Note:** Aggregator state should be stored in the context object, not in closure variables, to ensure proper isolation between concurrent executions.

## Next Steps

- Read the [API Reference](./api-reference.md) for complete type signatures
- Explore the [examples](../examples/) for real-world applications
- Check the [architecture docs](./architecture.md) for a deep dive into the execution model
