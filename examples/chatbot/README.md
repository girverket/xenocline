# Chatbot Message Handler Example

A chatbot message processing pipeline with intent classification, knowledge base lookup, support ticketing, and human escalation.

## What It Demonstrates

- **Intent classification**: Route messages based on detected intent (FAQ, support, escalate)
- **Knowledge base lookup**: Match keywords to FAQ responses
- **Support ticketing**: Auto-create tickets for bug reports
- **Human escalation**: Route to human agents when requested
- **Shared post-processing**: All branches converge through a shared formatting phase
- **Filtered event handlers**: Analytics tracking + escalation alerts using `createFilteredHandler`
- **Conversation context**: Track history, user profile, and analytics

## Pipeline Flow

```
Ingest → Classify → Decision ─┬─→ FAQ Answer ────→ Format → Send
                              ├─→ Support Lookup → Format → Send
                              └─→ Escalate ──────→ Format → Send
```

## Run

```bash
npm install
npm start
```

## Sample Output

```
  [Ingest] Message from alice: "How do I reset my password?"
  [Classify] intent=faq, confidence=0.9
  [FAQ] Answer from kb:password reset
  [Format] Response formatted for faq intent
└─ Response:
   💡 To reset your password, go to Settings → Security → Reset Password...
   — Bot (faq • 10:32:15 AM)
```

## Extending

- Replace keyword classification with an NLP model or LLM
- Connect FAQ lookup to a vector database for semantic search
- Integrate support ticket creation with your ticketing system (Jira, Zendesk, etc.)
- Add a WebSocket phase to stream responses in real-time
