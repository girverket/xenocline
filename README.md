# Xenocline

A TypeScript framework for building processor pipelines — structured, composable workflows where data flows through phases connected by transitions.

## Why It Matters

Most data processing code starts as a simple function chain: `parse(transform(validate(input)))`. This works until it doesn't. Eventually you need to:

- **Branch** based on data (route invalid records to a dead-letter queue)
- **Run steps in parallel** and merge the results
- **Observe** what happened during execution (which phases ran, how long, what output)
- **Test** each processing step in isolation
- **Handle errors** at specific points without losing the whole pipeline

Xenocline gives you these capabilities without forcing you into a heavy framework. You define **phases** (processing units), connect them with **transitions** (connections, decisions, terminations), and execute them as a **process**. The framework handles the orchestration — routing, parallel execution, event emission, and result collection.

**Where it fits:**
- ETL pipelines (extract → validate → transform → load)
- AI/LLM chains (classify → route → research → draft → review)
- Request processing (ingest → authenticate → authorize → handle → respond)
- Chatbot message handling (classify intent → lookup → format → send)
- Any multi-step data transformation workflow

## Quickstart

### Install

```bash
npm install @girverket/xenocline
```

### A First Pipeline

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

// 1. Define phases — each phase takes input and returns output
const addPhase = createPhase('AddOne', {
    execute: async (input: { value: number }) => {
        return { value: input.value + 1 };
    },
});

const multiplyPhase = createPhase('MultiplyByTwo', {
    execute: async (input: { value: number }) => {
        return { value: input.value * 2 };
    },
});

// 2. Wrap phases in nodes and connect them
const process = createProcess('MyPipeline', {
    phases: {
        add: createPhaseNode('add', addPhase, {
            next: [createConnection('add-to-multiply', 'multiply')],
        }),
        multiply: createPhaseNode('multiply', multiplyPhase, {
            next: createTermination('done', {
                terminate: async (output) => output,
            }),
        }),
    },
});

// 3. Execute the pipeline
const beginning = createBeginning('begin', 'add');
const [results] = await executeProcess(process, beginning, {
    input: { value: 10 },
});

console.log(results['done']); // { value: 22 }
```

### Conditional Routing

Use `createDecision` to route data based on its content:

```typescript
import { createDecision } from '@girverket/xenocline';

const routeDecision = createDecision('RouteByValue', async (output) => {
    if (output.value > 100) {
        return [createConnection('to-expensive', 'expensiveHandler')];
    }
    return [createConnection('to-cheap', 'cheapHandler')];
});

// Use it as a node's `next`:
createPhaseNode('validate', validatePhase, {
    next: [routeDecision],
});
```

### Observability with Event Handlers

```typescript
import { createEventHandler } from '@girverket/xenocline';

const logger = createEventHandler(async (event, context) => {
    console.log(`[${event.type}:${event.stage}] ${event.sourceId}`);
});

const [results] = await executeProcess(process, beginning, {
    input: { value: 10 },
    eventHandlers: [logger],
});
```

## Core Concepts

| Concept | What it is | How to create |
|---------|-----------|---------------|
| **Phase** | A processing unit with an `execute` function | `createPhase(name, { execute })` |
| **PhaseNode** | A phase wrapped with routing (next transitions) | `createPhaseNode(id, phase, { next })` |
| **Aggregator** | Merges multiple parallel inputs into one output | `createAggregator(name, { aggregate })` |
| **Connection** | A direct path from one node to another | `createConnection(id, targetNodeId)` |
| **Decision** | Conditional routing — returns transitions based on output | `createDecision(id, decideFn)` |
| **Termination** | An endpoint that consumes output | `createTermination(id, { terminate })` |
| **Beginning** | The entry point of a pipeline | `createBeginning(id, targetNodeId)` |
| **Process** | A collection of nodes executed together | `createProcess(name, { phases })` |
| **EventHandler** | A callback that receives execution events | `createEventHandler(handleFn)` |

### Execution Flow

```
Beginning → Node A → [Connection] → Node B → [Decision] ─┬→ Node C → [Termination]
                                                          └→ Node D → [Termination]
```

1. `createBeginning` specifies the first node
2. Each node executes its phase, then follows its `next` transitions
3. `createConnection` routes to another node
4. `createDecision` dynamically chooses which transitions to return
5. `createTermination` ends the flow and stores the result
6. `executeProcess` returns `[results, phaseResults, context]`

## Examples

The [`examples/`](./examples/) directory contains three complete applications:

- **[ETL Pipeline](./examples/etl-pipeline/)** — Extract, transform, and load records with validation, enrichment, and conditional routing
- **[AI/LLM Chain](./examples/llm-chain/)** — Chain LLM calls with classification, research, drafting, and review
- **[Chatbot Handler](./examples/chatbot/)** — Process chat messages through intent classification, FAQ lookup, support ticketing, and escalation

## API Reference

### Phases

```typescript
createPhase<I, O>(name: string, options: {
    execute: (input: I, context: Context) => Promise<O>;
    verify?: (output: O, context: Context) => Promise<boolean>;
}): Phase<I, O>
```

### Nodes

```typescript
createPhaseNode<I, O>(id: string, phase: Phase<I, O>, options?: {
    next?: Termination | Connection[] | Decision[];
    prepare?: (input: Input, context: Context) => Promise<[Input, Context]>;
    process?: (output: O, context: Context) => Promise<[O, Context]>;
}): PhaseNode<I, O>

createAggregatorNode<O>(id: string, aggregator: Aggregator<O>, options?: {
    next?: Termination | Connection[] | Decision[];
}): AggregatorNode<O>
```

### Transitions

```typescript
createConnection(id: string, targetNodeId: string, options?: {
    transform?: (output: Output, context: Context) => Promise<[Input, Context]>;
}): Connection

createDecision<O>(id: string, decide: (output: O, context: Context) => Promise<Transition | Transition[]>): Decision

createTermination<O>(id: string, options?: {
    terminate?: (output: O, context: Context) => Promise<Output>;
}): Termination

createBeginning(id: string, targetNodeId: string, options?: {
    begin?: (input: Input, context: Context) => Promise<Input>;
}): Beginning
```

### Process & Execution

```typescript
createProcess(name: string, options: {
    phases: Record<string, PhaseNode | AggregatorNode>;
}): Process

executeProcess(
    process: Process,
    beginning: Beginning,
    options: {
        input: Input;
        context?: Context;
        eventHandlers?: EventHandler[];
    }
): Promise<[ProcessResults, PhaseResults, Context]>
```

### Aggregators

```typescript
createAggregator<O>(name: string, options: {
    aggregate: (input: Input, context: Context) => Promise<
        { status: 'Ready'; output: O } | { status: 'NotYetReady' }
    >;
}): Aggregator<O>
```

### Event System

```typescript
createEventHandler(handle: (event: Event, context: Context) => Promise<void>): EventHandler

createEventFilter(type?: string[], stage?: string[]): EventFilter

createFilteredHandler(filter: EventFilter, options: {
    handler?: EventHandler;
    handle?: (event: Event, context: Context) => Promise<void>;
}): FilteredHandler
```

## Requirements

- Node.js ≥ 24
- TypeScript ≥ 5.6 (recommended)

## Development

```bash
git clone https://github.com/girverket/xenocline.git
cd xenocline
npm install
npm test          # Run 369 tests
npm run build     # Build dist/
npm run coverage  # Generate coverage report (94% statements)
```

## License

Apache-2.0 — Copyright 2025 Tim O'Brien
