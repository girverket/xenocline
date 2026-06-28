import { describe, it, expect, vi } from 'vitest';
import { isNext, validateNext } from '../../src/transition/next';
import { createTermination } from '../../src/transition/termination';
import { createConnection } from '../../src/transition/connection';
import { createDecision } from '../../src/transition/decision';
import { Context } from '../../src/context';
import { Output } from '../../src/output';

describe('Next (transition)', () => {

    describe('isNext', () => {
        it('should return true for a valid Termination', () => {
            const term = createTermination('term1');
            expect(isNext(term)).toBe(true);
        });

        it('should return true for a valid array of Connections', () => {
            const conn = createConnection('c1', 'target1');
            expect(isNext([conn])).toBe(true);
        });

        it('should return true for a valid array of Decisions', () => {
            const dec = createDecision('d1', vi.fn());
            expect(isNext([dec])).toBe(true);
        });

        it('should return false for an empty array', () => {
            expect(isNext([])).toBe(false);
        });

        it('should return false for a non-array, non-termination value', () => {
            expect(isNext({ foo: 'bar' })).toBe(false);
            expect(isNext(42)).toBe(false);
            expect(isNext('string')).toBe(false);
            expect(isNext(null)).toBe(false);
            expect(isNext(undefined)).toBe(false);
        });

        it('should return false for an array with mixed types', () => {
            const conn = createConnection('c1', 'target1');
            const dec = createDecision('d1', vi.fn());
            expect(isNext([conn, dec])).toBe(false);
        });

        it('should return false for an array of invalid objects', () => {
            expect(isNext([{ foo: 'bar' }])).toBe(false);
        });
    });

    describe('validateNext', () => {
        it('should return no errors for a valid Termination', () => {
            const term = createTermination('term1');
            const errors = validateNext(term);
            expect(errors).toHaveLength(0);
        });

        it('should return no errors for a valid array of Connections', () => {
            const conn = createConnection('c1', 'target1');
            const errors = validateNext([conn]);
            expect(errors).toHaveLength(0);
        });

        it('should return an error for undefined', () => {
            const errors = validateNext(undefined);
            expect(errors).toHaveLength(1);
            expect(errors[0].error).toContain('undefined or null');
        });

        it('should return an error for null', () => {
            const errors = validateNext(null);
            expect(errors).toHaveLength(1);
            expect(errors[0].error).toContain('undefined or null');
        });

        it('should return an error for an empty array', () => {
            const errors = validateNext([]);
            expect(errors).toHaveLength(1);
            expect(errors[0].error).toContain('empty');
        });

        it('should return errors for an array of invalid objects', () => {
            const errors = validateNext([{ foo: 'bar' }]);
            expect(errors.length).toBeGreaterThan(0);
        });
    });
});
