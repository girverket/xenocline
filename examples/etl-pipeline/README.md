# ETL Pipeline Example

A real-world Extract-Transform-Load pipeline that processes raw records through validation, parallel enrichment/normalization, aggregation, and loading.

## What It Demonstrates

- **Sequential processing**: Extract → Validate → Transform → Load
- **Conditional routing**: Skip invalid records using `createDecision`
- **Parallel fan-out**: Enrich and Normalize run in parallel
- **Aggregation**: Merge parallel branch outputs with `createAggregator`
- **Event handlers**: Observability via `createEventHandler`
- **Type safety**: Typed inputs/outputs at every stage

## Pipeline Flow

```
Extract → Validate → Decision ─┬─→ Enrich ──→ Merge → Load → Done
                               │              ↗
                               ├─→ Normalize ┘
                               └─→ Skipped (termination)
```

## Run

```bash
npm install
npm start
```

## Sample Output

```
  [Extract] Processing record 001
  [Validate] ✅ Record 001 is valid
  [Enrich] Record 001 → region=APAC, bonus=550
  [Normalize] Record 001 → tier=GOLD, name=Alice
  [Merge] Record 001 merged successfully
  [Load] ✅ Record 001 loaded: Alice | GOLD | $5500 + $550 bonus | APAC
```
