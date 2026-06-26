# Examples

Standalone example applications that demonstrate xenocline solving real problems.

## Examples

- **[ETL Pipeline](./etl-pipeline/)** — Extract, transform, and load CSV data through a multi-stage pipeline with parallel processing and aggregation.
- **[AI/LLM Chain](./llm-chain/)** — Chain LLM calls together with conditional routing, retry logic, and response aggregation.
- **[Chatbot Message Handler](./chatbot/)** — Process incoming chat messages through classification, enrichment, and response generation phases.

## Running

Each example is self-contained. From the example directory:

```bash
npm install
npm start
```

Or run directly with tsx:

```bash
npx tsx src/index.ts
```

## Prerequisites

- Node.js ≥ 24
- The `@girverket/xenocline` package (installed automatically as a dependency)
