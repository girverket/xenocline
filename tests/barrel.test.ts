import { describe, it, expect } from 'vitest';

describe('Barrel exports', () => {
    describe('xenocline.ts', () => {
        it('should export all core creation functions', async () => {
            const xenocline = await import('../src/xenocline');
            expect(xenocline.createProcess).toBeDefined();
            expect(xenocline.createPhase).toBeDefined();
            expect(xenocline.createAggregator).toBeDefined();
            expect(xenocline.createPhaseNode).toBeDefined();
            expect(xenocline.createAggregatorNode).toBeDefined();
            expect(xenocline.createBeginning).toBeDefined();
            expect(xenocline.createConnection).toBeDefined();
            expect(xenocline.createDecision).toBeDefined();
            expect(xenocline.createTermination).toBeDefined();
            expect(xenocline.executeProcess).toBeDefined();
            expect(xenocline.createNode).toBeDefined();
            expect(xenocline.validateNode).toBeDefined();
        });

        it('should export all type guard functions', async () => {
            const xenocline = await import('../src/xenocline');
            expect(xenocline.isProcess).toBeDefined();
            expect(xenocline.isPhase).toBeDefined();
            expect(xenocline.isAggregator).toBeDefined();
            expect(xenocline.isPhaseNode).toBeDefined();
            expect(xenocline.isAggregatorNode).toBeDefined();
            expect(xenocline.isBeginning).toBeDefined();
            expect(xenocline.isConnection).toBeDefined();
            expect(xenocline.isDecision).toBeDefined();
            expect(xenocline.isTermination).toBeDefined();
            expect(xenocline.isNode).toBeDefined();
            expect(xenocline.isTransition).toBeDefined();
        });

        it('should export event-related functions', async () => {
            const xenocline = await import('../src/xenocline');
            expect(xenocline.createEventState).toBeDefined();
            expect(xenocline.dispatchEvent).toBeDefined();
            expect(xenocline.createEventHandler).toBeDefined();
            expect(xenocline.createEventFilter).toBeDefined();
            expect(xenocline.createFilteredHandler).toBeDefined();
        });

        it('should export event creation functions', async () => {
            const xenocline = await import('../src/xenocline');
            expect(xenocline.createProcessEvent).toBeDefined();
            expect(xenocline.createAggregatorEvent).toBeDefined();
            expect(xenocline.createNodeEvent).toBeDefined();
            expect(xenocline.createConnectionEvent).toBeDefined();
            expect(xenocline.createDecisionEvent).toBeDefined();
            expect(xenocline.createTerminationEvent).toBeDefined();
            expect(xenocline.createBeginningEvent).toBeDefined();
            expect(xenocline.createTransitionEvent).toBeDefined();
        });

        it('should export event type guards', async () => {
            const xenocline = await import('../src/xenocline');
            expect(xenocline.isProcessEvent).toBeDefined();
            expect(xenocline.isAggregatorEvent).toBeDefined();
            expect(xenocline.isNodeEvent).toBeDefined();
            expect(xenocline.isConnectionEvent).toBeDefined();
            expect(xenocline.isDecisionEvent).toBeDefined();
            expect(xenocline.isTerminationEvent).toBeDefined();
            expect(xenocline.isBeginningEvent).toBeDefined();
            expect(xenocline.isAggregatorNodeEvent).toBeDefined();
            expect(xenocline.isPhaseNodeEvent).toBeDefined();
        });
    });

    describe('event.ts', () => {
        it('should export event types and creation functions', async () => {
            const eventModule = await import('../src/event');
            expect(eventModule.createAggregatorEvent).toBeDefined();
            expect(eventModule.createProcessEvent).toBeDefined();
            expect(eventModule.createNodeEvent).toBeDefined();
            expect(eventModule.createConnectionEvent).toBeDefined();
            expect(eventModule.createDecisionEvent).toBeDefined();
            expect(eventModule.createTerminationEvent).toBeDefined();
            expect(eventModule.createBeginningEvent).toBeDefined();
            expect(eventModule.createTransitionEvent).toBeDefined();
            expect(eventModule.createEventState).toBeDefined();
            expect(eventModule.dispatchEvent).toBeDefined();
            expect(eventModule.createEventHandler).toBeDefined();
        });

        it('should export event type guards', async () => {
            const eventModule = await import('../src/event');
            expect(eventModule.isAggregatorEvent).toBeDefined();
            expect(eventModule.isProcessEvent).toBeDefined();
            expect(eventModule.isNodeEvent).toBeDefined();
            expect(eventModule.isConnectionEvent).toBeDefined();
            expect(eventModule.isDecisionEvent).toBeDefined();
            expect(eventModule.isTerminationEvent).toBeDefined();
            expect(eventModule.isBeginningEvent).toBeDefined();
            expect(eventModule.isAggregatorNodeEvent).toBeDefined();
            expect(eventModule.isPhaseNodeEvent).toBeDefined();
        });
    });

    describe('context.ts', () => {
        it('should allow arbitrary key-value pairs', async () => {
            const ctx: Record<string, unknown> = { foo: 'bar', count: 42, nested: { a: 1 } };
            expect(ctx.foo).toBe('bar');
            expect(ctx.count).toBe(42);
            expect((ctx.nested as Record<string, number>).a).toBe(1);
        });
    });
});
