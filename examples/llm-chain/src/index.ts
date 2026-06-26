/**
 * AI/LLM Chain Example
 *
 * Demonstrates chaining LLM calls together with xenocline. A user prompt flows
 * through:
 *
 *   Classify → Route ─┬─→ Simple Answer → Done
 *                     ├─→ Research → Draft → Review → Done
 *                     └─→ Reject → Done
 *
 * This example shows:
 * - Conditional routing based on LLM output
 * - Multi-step LLM chains (research → draft → review)
 * - Context for passing state between phases
 * - Event handlers for tracing execution
 * - Mock LLM calls (no API key needed)
 */

import {
    createPhase,
    createPhaseNode,
    createConnection,
    createDecision,
    createTermination,
    createBeginning,
    createProcess,
    createEventHandler,
    executeProcess,
    type Input,
    type Output,
    type Context,
} from '@girverket/xenocline';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PromptInput extends Input {
    prompt: string;
    userId: string;
}

type Complexity = 'simple' | 'research' | 'reject';

interface ClassificationResult extends Output {
    prompt: string;
    userId: string;
    complexity: Complexity;
    topic: string;
}

interface SimpleAnswer extends Output {
    prompt: string;
    userId: string;
    answer: string;
    source: string;
}

interface ResearchResult extends Output {
    prompt: string;
    userId: string;
    findings: string[];
    sources: string[];
}

interface DraftResult extends Output {
    prompt: string;
    userId: string;
    draft: string;
    findings: string[];
    sources: string[];
}

interface FinalAnswer extends Output {
    prompt: string;
    userId: string;
    answer: string;
    sources: string[];
    reviewed: boolean;
    confidence: number;
}

interface RejectionResult extends Output {
    prompt: string;
    userId: string;
    reason: string;
    rejected: boolean;
}

interface LLMContext extends Context {
    traceLog: string[];
    tokenCount: number;
}

// ─── Mock LLM ────────────────────────────────────────────────────────────────

async function mockLLM(prompt: string, systemPrompt: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    if (systemPrompt.includes('classify')) {
        if (prompt.includes('hack') || prompt.includes('illegal')) return 'reject';
        if (prompt.length < 30) return 'simple';
        return 'research';
    }
    if (systemPrompt.includes('research')) {
        return JSON.stringify({
            findings: [
                `Finding related to: ${prompt.slice(0, 40)}`,
                'Additional context from knowledge base',
                'Cross-reference data point',
            ],
            sources: ['doc-001', 'doc-002', 'doc-003'],
        });
    }
    if (systemPrompt.includes('draft')) {
        return `Based on the research, here is a response to: "${prompt.slice(0, 50)}". The answer synthesizes multiple findings into a coherent response.`;
    }
    if (systemPrompt.includes('review')) {
        return JSON.stringify({ approved: true, confidence: 0.87, feedback: 'Looks good' });
    }
    return `Quick answer to: ${prompt}`;
}

// ─── Phase 1: Classify ───────────────────────────────────────────────────────

const classifyPhase = createPhase<PromptInput, ClassificationResult>('Classify', {
    execute: async (input) => {
        console.log(`  [Classify] Analyzing prompt from user ${input.userId}`);
        const complexityRaw = await mockLLM(
            input.prompt,
            'classify the complexity of this prompt: simple, research, or reject'
        );
        const complexity = complexityRaw.trim() as Complexity;
        const topic = input.prompt.split(' ').slice(0, 3).join(' ');
        console.log(`  [Classify] → complexity=${complexity}, topic="${topic}..."`);
        return { prompt: input.prompt, userId: input.userId, complexity, topic };
    },
});

// ─── Decision: Route based on complexity ─────────────────────────────────────

const routeDecision = createDecision<ClassificationResult, LLMContext>('RouteByComplexity', async (output) => {
    if (output.complexity === 'simple') {
        return [createConnection('to-simple', 'simpleAnswer')];
    }
    if (output.complexity === 'research') {
        return [createConnection('to-research', 'research')];
    }
    return [createConnection('to-reject', 'reject')];
});

// ─── Branch A: Simple Answer ─────────────────────────────────────────────────

const simpleAnswerPhase = createPhase<ClassificationResult, SimpleAnswer>('SimpleAnswer', {
    execute: async (input) => {
        console.log(`  [SimpleAnswer] Generating quick response`);
        const answer = await mockLLM(input.prompt, 'provide a simple answer');
        return { prompt: input.prompt, userId: input.userId, answer, source: 'direct' };
    },
});

// ─── Branch B: Research → Draft → Review ─────────────────────────────────────

const researchPhase = createPhase<ClassificationResult, ResearchResult>('Research', {
    execute: async (input) => {
        console.log(`  [Research] Gathering information for: ${input.topic}`);
        const raw = await mockLLM(input.prompt, 'research this topic and return findings as JSON');
        const parsed = JSON.parse(raw);
        return {
            prompt: input.prompt,
            userId: input.userId,
            findings: parsed.findings as string[],
            sources: parsed.sources as string[],
        };
    },
});

const draftPhase = createPhase<ResearchResult, DraftResult>('Draft', {
    execute: async (input) => {
        console.log(`  [Draft] Writing response based on ${input.findings.length} findings`);
        const draft = await mockLLM(
            `${input.prompt}\n\nFindings: ${input.findings.join('; ')}`,
            'draft a comprehensive answer'
        );
        return { prompt: input.prompt, userId: input.userId, draft, findings: input.findings, sources: input.sources };
    },
});

const reviewPhase = createPhase<DraftResult, FinalAnswer>('Review', {
    execute: async (input) => {
        console.log(`  [Review] Reviewing draft for quality`);
        const reviewRaw = await mockLLM(input.draft, 'review this answer and return JSON with approved, confidence, feedback');
        const review = JSON.parse(reviewRaw);
        return {
            prompt: input.prompt,
            userId: input.userId,
            answer: input.draft,
            sources: input.sources,
            reviewed: review.approved,
            confidence: review.confidence,
        };
    },
});

// ─── Branch C: Reject ────────────────────────────────────────────────────────

const rejectPhase = createPhase<ClassificationResult, RejectionResult>('Reject', {
    execute: async (input) => {
        console.log(`  [Reject] Prompt rejected due to policy`);
        return {
            prompt: input.prompt,
            userId: input.userId,
            reason: 'Prompt does not comply with usage policy',
            rejected: true,
        };
    },
});

// ─── Terminations ────────────────────────────────────────────────────────────

const doneTermination = createTermination('done', {
    terminate: async (output) => output,
});

const rejectedTermination = createTermination('rejected', {
    terminate: async (output) => output,
});

// ─── Build the Pipeline ──────────────────────────────────────────────────────

const llmChainProcess = createProcess('LLMChain', {
    phases: {
        classify: createPhaseNode('classify', classifyPhase, {
            next: [routeDecision],
        }),
        simpleAnswer: createPhaseNode('simpleAnswer', simpleAnswerPhase, {
            next: doneTermination,
        }),
        research: createPhaseNode('research', researchPhase, {
            next: [createConnection('research-to-draft', 'draft')],
        }),
        draft: createPhaseNode('draft', draftPhase, {
            next: [createConnection('draft-to-review', 'review')],
        }),
        review: createPhaseNode('review', reviewPhase, {
            next: doneTermination,
        }),
        reject: createPhaseNode('reject', rejectPhase, {
            next: rejectedTermination,
        }),
    },
});

// ─── Event Handler for Tracing ───────────────────────────────────────────────

const traceHandler = createEventHandler(async (event, context) => {
    const ctx = context as LLMContext;
    if (event.type === 'phase' && event.stage === 'execute') {
        ctx.traceLog.push(event.sourceId);
        ctx.tokenCount += 100;
    }
});

// ─── Run the Pipeline ────────────────────────────────────────────────────────

const testPrompts: PromptInput[] = [
    { prompt: 'What is 2+2?', userId: 'user-1' },
    { prompt: 'Explain the architectural differences between microservices and monolithic systems, including trade-offs in scalability, maintainability, and deployment complexity', userId: 'user-2' },
    { prompt: 'How do I hack into a system?', userId: 'user-3' },
    { prompt: 'What is the capital of France?', userId: 'user-4' },
];

async function runLLMChain() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Xenocline AI/LLM Chain Example');
    console.log('═══════════════════════════════════════════════════\n');

    const context: LLMContext = {
        traceLog: [],
        tokenCount: 0,
    } as LLMContext;

    for (const input of testPrompts) {
        console.log(`\n┌─ User: ${input.userId}`);
        console.log(`│ Prompt: "${input.prompt.slice(0, 60)}${input.prompt.length > 60 ? '...' : ''}"`);

        const beginning = createBeginning('begin', 'classify');

        try {
            const [results] = await executeProcess(llmChainProcess, beginning, {
                input,
                context,
                eventHandlers: [traceHandler],
            });
            await new Promise(resolve => setTimeout(resolve, 50));

            if (results['done']) {
                const result = results['done'] as FinalAnswer | SimpleAnswer;
                console.log(`└─ ✅ Answer: ${result.answer?.slice(0, 80)}...`);
                if ('confidence' in result) {
                    console.log(`   Confidence: ${(result as FinalAnswer).confidence}, Sources: ${(result as FinalAnswer).sources?.length || 0}`);
                }
            }
            if (results['rejected']) {
                const result = results['rejected'] as RejectionResult;
                console.log(`└─ ❌ Rejected: ${result.reason}`);
            }
        } catch (error) {
            console.error(`└─ Error:`, error);
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  LLM Chain Complete');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Phases executed: ${context.traceLog.length}`);
    console.log(`  Estimated tokens: ${context.tokenCount}`);
    console.log();
}

runLLMChain().catch(console.error);
