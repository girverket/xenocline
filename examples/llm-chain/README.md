# AI/LLM Chain Example

Chain LLM calls together with conditional routing, multi-step reasoning, and quality review.

## What It Demonstrates

- **Conditional routing**: Classify prompt complexity, then route to different processing chains
- **Multi-step LLM chains**: Research → Draft → Review pipeline
- **Decision-based branching**: `createDecision` routes based on classification output
- **Context for state**: Track token usage and execution trace across phases
- **Event handlers**: Trace every phase execution
- **Mock LLM calls**: Runs without any API keys

## Pipeline Flow

```
Classify → Decision ─┬─→ Simple Answer → Done
                     ├─→ Research → Draft → Review → Done
                     └─→ Reject → Rejected
```

## Run

```bash
npm install
npm start
```

## Replacing the Mock LLM

The `mockLLM` function simulates LLM responses. To use a real LLM, replace it with your API call:

```typescript
async function mockLLM(prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
        }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
}
```
