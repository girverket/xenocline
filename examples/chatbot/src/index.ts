/**
 * Chatbot Message Handler Example
 *
 * Demonstrates a chatbot message processing pipeline using xenocline. Incoming
 * messages flow through:
 *
 *   Ingest → Classify Intent → Route ─┬─→ FAQ Answer → Format → Send
 *                                     ├─→ Support Lookup → Format → Send
 *                                     └─→ Escalate → Format → Send
 *
 * This example shows:
 * - Intent classification with conditional routing
 * - Knowledge base lookup with context enrichment
 * - Response formatting as a shared post-processing step
 * - Conversation context (history, user profile)
 * - Event handlers for analytics and logging
 * - Multiple branches converging through a shared node
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
    createEventFilter,
    createFilteredHandler,
    executeProcess,
    type Input,
    type Output,
    type Context,
} from '@girverket/xenocline';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IncomingMessage extends Input {
    text: string;
    userId: string;
    conversationId: string;
    timestamp: string;
}

type Intent = 'faq' | 'support' | 'escalate';

interface ClassifiedMessage extends Output {
    text: string;
    userId: string;
    conversationId: string;
    timestamp: string;
    intent: Intent;
    confidence: number;
    language: string;
}

interface FAQResponse extends Output {
    text: string;
    userId: string;
    conversationId: string;
    intent: Intent;
    answer: string;
    source: string;
}

interface SupportResponse extends Output {
    text: string;
    userId: string;
    conversationId: string;
    intent: Intent;
    answer: string;
    ticketId: string;
}

interface EscalationResponse extends Output {
    text: string;
    userId: string;
    conversationId: string;
    intent: Intent;
    answer: string;
    escalatedTo: string;
}

interface FormattedResponse extends Output {
    text: string;
    userId: string;
    conversationId: string;
    intent: Intent;
    answer: string;
    formatted: string;
    sentAt: string;
}

interface ChatbotContext extends Context {
    conversationHistory: Array<{ role: string; text: string }>;
    userProfile: { userId: string; name: string; tier: string };
    analytics: {
        messagesProcessed: number;
        intentsDetected: Record<string, number>;
        escalations: number;
    };
}

// ─── Mock Knowledge Base ─────────────────────────────────────────────────────

const faqKnowledgeBase: Record<string, string> = {
    'password reset': 'To reset your password, go to Settings → Security → Reset Password. You\'ll receive an email with a reset link.',
    'billing': 'You can view and manage your billing at Account → Billing. For invoice questions, contact billing@company.com.',
    'hours': 'Our support team is available Monday–Friday, 9 AM – 6 PM PT. You can also search our docs anytime.',
    'api key': 'Generate API keys in Settings → Developer → API Keys. Keep them secure and never commit them to version control.',
    'default': 'I\'m not sure I understand. Could you rephrase your question, or type "help" to see what I can do?',
};

const supportTickets: string[] = [];

// ─── Phase 1: Ingest ─────────────────────────────────────────────────────────

const ingestPhase = createPhase<IncomingMessage, IncomingMessage>('Ingest', {
    execute: async (input) => {
        const text = input.text.trim().toLowerCase();
        console.log(`  [Ingest] Message from ${input.userId}: "${input.text}"`);
        return { ...input, text };
    },
});

// ─── Phase 2: Classify Intent ────────────────────────────────────────────────

const classifyPhase = createPhase<IncomingMessage, ClassifiedMessage>('ClassifyIntent', {
    execute: async (input) => {
        let intent: Intent = 'faq';
        let confidence = 0.5;

        if (input.text.includes('password') || input.text.includes('billing') ||
            input.text.includes('hours') || input.text.includes('api key') ||
            input.text.includes('how do i') || input.text.includes('what is')) {
            intent = 'faq';
            confidence = 0.9;
        } else if (input.text.includes('bug') || input.text.includes('error') ||
                   input.text.includes('broken') || input.text.includes('not working') ||
                   input.text.includes('issue') || input.text.includes('problem') ||
                   input.text.includes('crash') || input.text.includes('fail')) {
            intent = 'support';
            confidence = 0.85;
        } else if (input.text.includes('human') || input.text.includes('agent') ||
                   input.text.includes('manager') || input.text.includes('escalate')) {
            intent = 'escalate';
            confidence = 0.95;
        }

        console.log(`  [Classify] intent=${intent}, confidence=${confidence}`);
        return { ...input, intent, confidence, language: 'en' };
    },
});

// ─── Decision: Route by Intent ───────────────────────────────────────────────

const routeByIntent = createDecision<ClassifiedMessage, ChatbotContext>('RouteByIntent', async (output) => {
    if (output.intent === 'faq') {
        return [createConnection('to-faq', 'faqAnswer')];
    }
    if (output.intent === 'support') {
        return [createConnection('to-support', 'supportLookup')];
    }
    return [createConnection('to-escalate', 'escalate')];
});

// ─── Branch A: FAQ Answer ────────────────────────────────────────────────────

const faqAnswerPhase = createPhase<ClassifiedMessage, FAQResponse>('FAQAnswer', {
    execute: async (input) => {
        let answer = faqKnowledgeBase['default'];
        let source = 'fallback';

        for (const [keyword, response] of Object.entries(faqKnowledgeBase)) {
            if (keyword !== 'default') {
                const keywordWords = keyword.split(' ');
                if (keywordWords.every(word => input.text.includes(word))) {
                    answer = response;
                    source = `kb:${keyword}`;
                    break;
                }
            }
        }

        console.log(`  [FAQ] Answer from ${source}`);
        return {
            text: input.text,
            userId: input.userId,
            conversationId: input.conversationId,
            intent: input.intent,
            answer,
            source,
        };
    },
});

// ─── Branch B: Support Lookup ───────────────────────────────────────────────

const supportLookupPhase = createPhase<ClassifiedMessage, SupportResponse>('SupportLookup', {
    execute: async (input) => {
        const ticketId = `TKT-${String(supportTickets.length + 1).padStart(4, '0')}`;
        supportTickets.push(ticketId);

        const answer = `I understand you're experiencing an issue. I've created ticket ${ticketId} for you. ` +
            `Our support team will investigate and follow up within 24 hours. ` +
            `In the meantime, try clearing your cache and refreshing the page.`;

        console.log(`  [Support] Created ticket ${ticketId}`);
        return {
            text: input.text,
            userId: input.userId,
            conversationId: input.conversationId,
            intent: input.intent,
            answer,
            ticketId,
        };
    },
});

// ─── Branch C: Escalate ──────────────────────────────────────────────────────

const escalatePhase = createPhase<ClassifiedMessage, EscalationResponse>('Escalate', {
    execute: async (input) => {
        const answer = `I'm connecting you with a human agent who can better assist you. ` +
            `Please hold while I transfer your conversation. Your message has been flagged for priority handling.`;

        console.log(`  [Escalate] Escalating to human agent`);
        return {
            text: input.text,
            userId: input.userId,
            conversationId: input.conversationId,
            intent: input.intent,
            answer,
            escalatedTo: 'human-agent-queue',
        };
    },
});

// ─── Shared Phase: Format Response ───────────────────────────────────────────

const formatPhase = createPhase<FAQResponse | SupportResponse | EscalationResponse, FormattedResponse>('FormatResponse', {
    execute: async (input) => {
        const intentEmoji: Record<string, string> = {
            faq: '💡',
            support: '🛠️',
            escalate: '👤',
        };
        const emoji = intentEmoji[input.intent] || '🤖';
        const formatted = `${emoji} ${input.answer}\n\n— Bot (${input.intent} • ${new Date().toLocaleTimeString()})`;

        console.log(`  [Format] Response formatted for ${input.intent} intent`);
        return {
            text: input.text,
            userId: input.userId,
            conversationId: input.conversationId,
            intent: input.intent,
            answer: input.answer,
            formatted,
            sentAt: new Date().toISOString(),
        };
    },
});

// ─── Termination ─────────────────────────────────────────────────────────────

const sentTermination = createTermination<FormattedResponse, ChatbotContext>('sent', {
    terminate: async (output) => output,
});

// ─── Build the Pipeline ──────────────────────────────────────────────────────

const chatbotProcess = createProcess('ChatbotPipeline', {
    phases: {
        ingest: createPhaseNode('ingest', ingestPhase, {
            next: [createConnection('ingest-to-classify', 'classify')],
        }),
        classify: createPhaseNode('classify', classifyPhase, {
            next: [routeByIntent],
        }),
        faqAnswer: createPhaseNode('faqAnswer', faqAnswerPhase, {
            next: [createConnection('faq-to-format', 'format')],
        }),
        supportLookup: createPhaseNode('supportLookup', supportLookupPhase, {
            next: [createConnection('support-to-format', 'format')],
        }),
        escalate: createPhaseNode('escalate', escalatePhase, {
            next: [createConnection('escalate-to-format', 'format')],
        }),
        format: createPhaseNode('format', formatPhase, {
            next: sentTermination,
        }),
    },
});

// ─── Event Handlers ──────────────────────────────────────────────────────────

const analyticsHandler = createEventHandler(async (event, context) => {
    const ctx = context as ChatbotContext;
    if (event.type === 'phase' && event.stage === 'execute') {
        ctx.analytics.messagesProcessed++;
    }
});

const escalationFilter = createEventFilter(['phase'], ['execute']);
const escalationAlertHandler = createFilteredHandler(escalationFilter, {
    handle: async (event, context) => {
        if (event.sourceId === 'escalate') {
            const ctx = context as ChatbotContext;
            ctx.analytics.escalations++;
            console.log(`  ⚠️  ESCALATION ALERT: Human agent needed for conversation`);
        }
    },
});

// ─── Run the Pipeline ────────────────────────────────────────────────────────

const testMessages: IncomingMessage[] = [
    { text: 'How do I reset my password?', userId: 'alice', conversationId: 'conv-1', timestamp: new Date().toISOString() },
    { text: 'The app keeps crashing when I upload files', userId: 'bob', conversationId: 'conv-2', timestamp: new Date().toISOString() },
    { text: 'I need to speak to a human manager', userId: 'charlie', conversationId: 'conv-3', timestamp: new Date().toISOString() },
    { text: 'What are your support hours?', userId: 'alice', conversationId: 'conv-1', timestamp: new Date().toISOString() },
    { text: 'How do I get an API key?', userId: 'diana', conversationId: 'conv-4', timestamp: new Date().toISOString() },
];

async function runChatbot() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Xenocline Chatbot Message Handler Example');
    console.log('═══════════════════════════════════════════════════\n');

    const context: ChatbotContext = {
        conversationHistory: [],
        userProfile: { userId: 'system', name: 'Bot', tier: 'standard' },
        analytics: {
            messagesProcessed: 0,
            intentsDetected: {},
            escalations: 0,
        },
    } as ChatbotContext;

    for (const message of testMessages) {
        console.log(`\n┌─ ${message.userId} @ ${message.conversationId}`);
        const beginning = createBeginning('begin', 'ingest');

        try {
            const [results] = await executeProcess(chatbotProcess, beginning, {
                input: message,
                context,
                eventHandlers: [analyticsHandler, escalationAlertHandler],
            });
            await new Promise(resolve => setTimeout(resolve, 50));

            if (results['sent']) {
                const response = results['sent'] as FormattedResponse;
                console.log(`└─ Response:`);
                console.log(`   ${response.formatted}`);

                context.analytics.intentsDetected[response.intent] =
                    (context.analytics.intentsDetected[response.intent] || 0) + 1;

                context.conversationHistory.push({ role: 'user', text: message.text });
                context.conversationHistory.push({ role: 'bot', text: response.answer });
            }
        } catch (error) {
            console.error(`└─ Error:`, error);
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  Chatbot Session Complete');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Messages processed: ${context.analytics.messagesProcessed}`);
    console.log(`  Intent breakdown:`, context.analytics.intentsDetected);
    console.log(`  Escalations: ${context.analytics.escalations}`);
    console.log(`  Support tickets created: ${supportTickets.length}`);
    console.log(`  Conversation history: ${context.conversationHistory.length} messages`);
    console.log();
}

runChatbot().catch(console.error);
