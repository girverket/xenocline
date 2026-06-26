# Changelog

## 1.0.0

**Release date: 2025-06-26**

### Overview

First stable release. Xenocline is a TypeScript framework for building processor pipelines — structured, composable workflows where data flows through phases connected by transitions.

### What's New

- **Three standalone example applications**:
  - ETL Pipeline — extract, validate, transform, and load records with conditional routing
  - AI/LLM Chain — chain LLM calls with classification, research, drafting, and review
  - Chatbot Message Handler — process chat messages through intent classification, FAQ lookup, support ticketing, and escalation

- **Comprehensive documentation**:
  - Rewritten README with "why it matters" pitch and quickstart
  - Quickstart guide covering linear pipelines, conditional routing, events, context, and aggregation
  - Complete API reference with type signatures for every exported function

- **Improved website**:
  - New landing page with problem statement, use cases, and example links
  - Integrated documentation links
  - Production-ready stats section

### Core Features

- **Phases**: Type-safe processing units with execute and optional verify functions
- **Transitions**: Connections (direct routing), Decisions (conditional routing), Terminations (endpoints)
- **Aggregators**: Merge parallel branch outputs with custom merge logic
- **Event System**: Observe execution via event handlers with filtering
- **Context**: Shared mutable state across phases
- **Validation**: Runtime validation for all framework objects

### Quality

- 369 tests passing (36 test files)
- 94% statement coverage
- Zero known vulnerabilities
- Zero TODOs/FIXMEs in source code
- Builds clean with zero errors

### Breaking Changes

None — this is the first stable release. The API has been stable since the 0.0.x series.

### Requirements

- Node.js ≥ 24
- TypeScript ≥ 5.6 (recommended)

### License

Apache-2.0
