# Architecture

Xenocline is a TypeScript processor pipeline framework for building asynchronous, multi-stage data processing workflows. This document describes the core architectural concepts and how they fit together.

## Overview

A Xenocline process is a directed graph of **nodes** connected by **transitions**. Data flows through the graph from a **beginning** transition, through one or more **phase** or **aggregator** nodes, and ends at one or more **termination** transitions.

```
Beginning → Phase → Decision → Phase → Termination
                        ↓
                   Phase → Aggregator → Termination
```

## Core Concepts

### Process

A `Process` is the top-level container. It holds a collection of nodes (phases and aggregators) and is executed via `executeProcess()`. Execution starts from a `Beginning` transition that specifies the entry node, and flows through the graph until all reachable terminations are reached.

### Nodes

Nodes are the processing units in the graph. There are two types:

- **PhaseNode** — Processes a single input and produces a single output. A phase has a `process` function (`(input, context) => Promise<Output>`) and an optional `next` transition that determines where the output goes.
- **AggregatorNode** — Collects multiple inputs from different upstream paths and combines them into a single output via an `aggregate` function. An aggregator waits until all expected inputs have arrived before producing its output.

### Transitions

Transitions define how data moves between nodes. There are four types:

- **Beginning** — The entry point. Takes the initial input, optionally transforms it via a `begin` function, and routes it to the first node (`targetNodeId`).
- **Connection** — A direct link from one node to another. An optional `transform` function can adapt the output of the source node into the input expected by the target node.
- **Decision** — A branching point. A `decide` function inspects the current output and context, then returns one or more `Connection`s (for fan-out/parallel execution) or a `Termination`.
- **Termination** — The exit point. An optional `terminate` function can perform cleanup or final transformation on the output before it's collected as a result.

### Context

A `Context` is a shared mutable object (`{ [key: string]: unknown }`) passed through every phase, aggregator, and transition in the process. It allows nodes to share state without explicit parameter passing.

**Concurrency note:** In parallel execution scenarios (fan-out from a decision to multiple connections), each connection's transform receives the same source context. Context mutations from one connection may be overwritten by another. Use unique context keys per path to avoid conflicts.

### Input and Output

- `Input` — The data entering a node. An extensible interface that nodes receive for processing.
- `Output` — The data produced by a node. An extensible interface that flows to the next transition.

Both are intentionally generic to support any data shape.

## Execution Model

1. `executeProcess()` validates the process definition.
2. The `Beginning` transition's `begin` function transforms the initial input.
3. The entry node is executed with the transformed input.
4. Each node's `next` transition (Connection, Decision, or Termination) determines the next step.
5. Decisions can return multiple connections, enabling parallel execution paths.
6. Aggregators collect inputs from all incoming paths before executing their `aggregate` function.
7. Terminations collect final outputs into the results map.
8. The process completes when all active execution paths have reached a termination.

### Parallel Execution

When a `Decision` returns multiple connections, Xenocline executes them concurrently. All active executions are tracked and awaited before the process completes. This enables fan-out patterns like:

- Splitting a batch into parallel processing streams
- Sending the same data to multiple independent processors
- Merging results via an aggregator

### Aggregator Behavior

Aggregators are the synchronization point for parallel paths. They:

1. Receive inputs from multiple upstream connections
2. Wait until all expected inputs have arrived
3. Execute the `aggregate` function with all collected inputs
4. Produce a single output that flows to the aggregator's `next` transition

If an aggregator doesn't receive all expected inputs by the time the process completes, it rejects with an error. This ensures incomplete aggregations are surfaced rather than silently dropped.

## Events

Xenocline emits events throughout the execution lifecycle:

- **Process events** — `start` and `end` for the overall process
- **Beginning events** — `start` and `begin` for the entry transition
- **Phase events** — `start` and `end` for each phase execution
- **Aggregator events** — `start` and `end` for aggregation
- **Connection events** — Emitted when data flows through a connection
- **Decision events** — Emitted when a decision is evaluated
- **Termination events** — Emitted when a termination is reached

Event handlers can be registered via `ProcessExecutionOptions.eventHandlers` and receive the event along with the current context.

## Validation

Xenocline provides comprehensive validation functions for all components (`validateProcess`, `validateNode`, `validateTransition`, etc.). Validation runs automatically at the start of `executeProcess()` and throws with detailed error messages if the process definition is invalid.

## Type Safety

The framework is fully generic, with type parameters for:

- `I` — Input type (extends `Input`)
- `O` — Output type (extends `Output`)
- `C` — Context type (extends `Context`)

This allows you to define strongly-typed processes where each node's input and output types are checked at compile time.
