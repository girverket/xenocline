# API Reference

Complete type signatures for the xenocline framework.

## Core Types

### Input

```typescript
interface Input {
    [key: string]: unknown;
}
```

The base input type. All phase inputs extend this.

### Output

```typescript
interface Output {
    [key: string]: unknown;
}
```

The base output type. All phase outputs extend this.

### Context

```typescript
interface Context {
    [key: string]: unknown;
}
```

Shared mutable state passed through the pipeline. Phases can read and write to it.

## Phases

### createPhase

```typescript
function createPhase<I extends Input, O extends Output>(
    name: string,
    options: {
        execute: (input: I, context: Context) => Promise<O>;
        verify?: (output: O, context: Context) => Promise<boolean>;
    }
): Readonly<Phase<I, O>>
```

Creates a phase — the fundamental processing unit.

- **name**: Unique identifier for the phase
- **execute**: Async function that transforms input to output
- **verify** (optional): Async function that validates output. If it returns `false`, an error is thrown.

### Phase

```typescript
interface Phase<I extends Input, O extends Output> {
    name: string;
    execute: (input: I, context: Context) => Promise<O>;
    verify?: (output: O, context: Context) => Promise<boolean>;
}
```

## Nodes

### createPhaseNode

```typescript
function createPhaseNode<I extends Input, O extends Output>(
    id: string,
    phase: Phase<I, O>,
    options?: {
        next?: Next<O>;
        prepare?: (input: Input, context: Context) => Promise<[Input, Context]>;
        process?: (output: O, context: Context) => Promise<[O, Context]>;
    }
): Readonly<PhaseNode<I, O>>
```

Wraps a phase with routing information and optional pre/post hooks.

- **id**: Unique node ID within the process
- **phase**: The phase to execute
- **next**: Where to route after execution (see Transitions below)
- **prepare** (optional): Transform input before the phase executes
- **process** (optional): Transform output after the phase executes

### createAggregatorNode

```typescript
function createAggregatorNode<O extends Output>(
    id: string,
    aggregator: Aggregator<O>,
    options?: {
        next?: Next<O>;
    }
): Readonly<AggregatorNode<O>>
```

Creates a node that aggregates multiple parallel inputs.

### Next

```typescript
type Next<O extends Output> =
    | Termination<O>
    | ReadonlyArray<Connection<O>>
    | ReadonlyArray<Decision<O>>;
```

The `next` property of a node. Must be one of:
- A single `Termination` (end the pipeline)
- An array of `Connection`s (route to nodes)
- An array of `Decision`s (conditional routing)

## Aggregators

### createAggregator

```typescript
function createAggregator<O extends Output>(
    name: string,
    options: {
        aggregate: (input: Input, context: Context) => Promise<AggregationResult<O>>;
    }
): Readonly<Aggregator<O>>
```

Creates an aggregator that merges multiple inputs.

### AggregationResult

```typescript
type AggregationResult<O extends Output> =
    | { status: 'Ready'; output: O }
    | { status: 'NotYetReady' };
```

Return `'Ready'` when all expected inputs have been received, `'NotYetReady'` otherwise.

> **Important:** Store aggregation state in the context object, not in closure variables, to ensure proper isolation between concurrent process executions.

## Transitions

### createConnection

```typescript
function createConnection<O extends Output>(
    id: string,
    targetNodeId: string,
    options?: {
        transform?: (output: O, context: Context) => Promise<[Input, Context]>;
    }
): Readonly<Connection<O>>
```

Creates a direct connection from one node to another.

- **id**: Unique connection ID
- **targetNodeId**: ID of the target node in the process
- **transform** (optional): Transform the output before passing to the target node. Default: pass-through.

### createDecision

```typescript
function createDecision<O extends Output>(
    id: string,
    decide: (output: O, context: Context) => Promise<Transition | ReadonlyArray<Transition>>
): Readonly<Decision<O>>
```

Creates a conditional routing decision. The `decide` function receives the phase output and returns:
- A single `Termination` (end the pipeline)
- An array of `Connection`s and/or `Decision`s (route to nodes)

### createTermination

```typescript
function createTermination<O extends Output>(
    id: string,
    options?: {
        terminate?: (output: O, context: Context) => Promise<Output>;
    }
): Readonly<Termination<O>>
```

Creates a termination point. The `terminate` function (optional) can transform the output before it's stored in results.

### createBeginning

```typescript
function createBeginning<I extends Input>(
    id: string,
    targetNodeId: string,
    options?: {
        begin?: (input: I, context: Context) => Promise<Input>;
    }
): Readonly<Beginning<I>>
```

Creates the entry point of a pipeline. The `begin` function (optional) can transform the initial input.

## Process & Execution

### createProcess

```typescript
function createProcess(
    name: string,
    options: {
        phases: Record<string, PhaseNode | AggregatorNode>;
    }
): Readonly<Process>
```

Creates a process — a collection of nodes that can be executed together.

### executeProcess

```typescript
function executeProcess(
    process: Process,
    beginning: Beginning,
    options: {
        input: Input;
        context?: Context;
        eventHandlers?: EventHandler[];
    }
): Promise<[ProcessResults, PhaseResults, Context]>
```

Executes a process and returns:
- **ProcessResults**: `Record<string, Output>` — outputs keyed by termination ID
- **PhaseResults**: `Record<string, Output>` — outputs keyed by node ID
- **Context**: The (potentially modified) context object

## Event System

### Event

```typescript
interface Event {
    type: 'process' | 'node' | 'phase' | 'transition';
    stage: 'start' | 'end' | 'execute' | 'terminate';
    sourceId: string;
    timestamp: number;
}
```

### createEventHandler

```typescript
function createEventHandler(
    handle: (event: Event, context: Context) => Promise<void>
): EventHandler
```

Creates an event handler that receives all events during execution.

### createEventFilter

```typescript
function createEventFilter(
    type?: string[],
    stage?: string[]
): EventFilter
```

Creates a filter that matches events by type and/or stage.

### createFilteredHandler

```typescript
function createFilteredHandler(
    filter: EventFilter,
    options: {
        handler?: EventHandler;
        handle?: (event: Event, context: Context) => Promise<void>;
    }
): FilteredHandler
```

Creates an event handler that only fires for events matching the filter.

## Type Guards

The framework exports type guard functions for runtime checking:

- `isPhase(obj): boolean`
- `isPhaseNode(obj): boolean`
- `isAggregator(obj): boolean`
- `isAggregatorNode(obj): boolean`
- `isConnection(obj): boolean`
- `isDecision(obj): boolean`
- `isTermination(obj): boolean`
- `isBeginning(obj): boolean`
- `isTransition(obj): boolean`
- `isNode(obj): boolean`
- `isProcess(obj): boolean`

## Validation

The framework exports validation functions that return arrays of errors:

- `validatePhase(item, coordinates?)`
- `validatePhaseNode(item, coordinates?)`
- `validateAggregator(item, coordinates?)`
- `validateAggregatorNode(item, coordinates?)`
- `validateConnection(item, coordinates?)`
- `validateDecision(item, coordinates?)`
- `validateTermination(item, coordinates?)`
- `validateBeginning(item, coordinates?)`
- `validateProcess(item, coordinates?)`
