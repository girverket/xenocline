/**
 * ETL Pipeline Example
 *
 * Demonstrates a real-world Extract-Transform-Load pipeline using xenocline.
 * Raw CSV-like records flow through:
 *
 *   Extract → Validate → Decision ─┬→ Enrich → Normalize → Load → Done
 *                                  └→ Skipped (termination)
 *
 * This example shows:
 * - Multi-phase sequential processing
 * - Conditional routing (skip invalid records)
 * - Decision-based branching
 * - Event handlers for observability
 * - Typed inputs/outputs throughout
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

interface RawRecord extends Input {
    id: string;
    name: string;
    email: string;
    amount: string;
    department: string;
}

interface ValidRecord extends Output {
    id: string;
    name: string;
    email: string;
    amount: number;
    department: string;
}

interface EnrichedRecord extends Output {
    id: string;
    name: string;
    email: string;
    amount: number;
    department: string;
    region: string;
    bonus: number;
}

interface NormalizedRecord extends Output {
    id: string;
    name: string;
    email: string;
    amount: number;
    department: string;
    region: string;
    bonus: number;
    tier: string;
}

interface LoadedRecord extends Output {
    id: string;
    name: string;
    email: string;
    amount: number;
    department: string;
    region: string;
    bonus: number;
    tier: string;
    loadedAt: string;
}

interface ETLContext extends Context {
    invalidRecords: string[];
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const rawData: RawRecord[] = [
    { id: '001', name: 'alice', email: 'alice@corp.com', amount: '5500', department: 'engineering' },
    { id: '002', name: 'bob', email: 'bob@corp.com', amount: '3200', department: 'sales' },
    { id: '003', name: 'charlie', email: 'not-an-email', amount: 'abc', department: 'marketing' },
    { id: '004', name: 'diana', email: 'diana@corp.com', amount: '8100', department: 'engineering' },
    { id: '005', name: 'eve', email: 'eve@corp.com', amount: '4500', department: 'design' },
];

// ─── Phase 1: Extract ────────────────────────────────────────────────────────

const extractPhase = createPhase<RawRecord, RawRecord>('Extract', {
    execute: async (input) => {
        console.log(`  [Extract] Processing record ${input.id}`);
        return input;
    },
});

// ─── Phase 2: Validate (with conditional routing) ────────────────────────────

const validatePhase = createPhase<RawRecord, ValidRecord | Output>('Validate', {
    execute: async (input) => {
        const emailValid = input.email.includes('@') && input.email.includes('.');
        const amountValid = !isNaN(parseFloat(input.amount));

        if (!emailValid || !amountValid) {
            console.log(`  [Validate] ❌ Record ${input.id} failed validation`);
            return { id: input.id, skipped: true, reason: 'Invalid email or amount' };
        }

        console.log(`  [Validate] ✅ Record ${input.id} is valid`);
        return {
            id: input.id,
            name: input.name,
            email: input.email,
            amount: parseFloat(input.amount),
            department: input.department,
        };
    },
});

// Decision: route valid records to enrich, invalid ones to skip
const routingDecision = createDecision<ValidRecord | Output, ETLContext>('RouteValid', async (output) => {
    if ('skipped' in output && output.skipped) {
        return createTermination('skipped', {
            terminate: async (out) => ({ ...out, skipped: true }),
        });
    }
    return [createConnection('to-enrich', 'enrich')];
});

// ─── Phase 3: Enrich ─────────────────────────────────────────────────────────

const enrichPhase = createPhase<ValidRecord, EnrichedRecord>('Enrich', {
    execute: async (input) => {
        const regionMap: Record<string, string> = {
            engineering: 'APAC',
            sales: 'NA',
            marketing: 'EU',
            design: 'NA',
        };
        const bonus = input.amount > 5000 ? input.amount * 0.1 : input.amount * 0.05;

        console.log(`  [Enrich] Record ${input.id} → region=${regionMap[input.department]}, bonus=${bonus}`);
        return {
            ...input,
            region: regionMap[input.department] || 'UNKNOWN',
            bonus: Math.round(bonus),
        };
    },
});

// ─── Phase 4: Normalize ──────────────────────────────────────────────────────

const normalizePhase = createPhase<EnrichedRecord, NormalizedRecord>('Normalize', {
    execute: async (input) => {
        const tier = input.amount > 7000 ? 'PLATINUM' : input.amount > 4000 ? 'GOLD' : 'SILVER';
        const capitalizedName = input.name.charAt(0).toUpperCase() + input.name.slice(1);

        console.log(`  [Normalize] Record ${input.id} → tier=${tier}, name=${capitalizedName}`);
        return {
            ...input,
            name: capitalizedName,
            tier,
        };
    },
});

// ─── Phase 5: Load ───────────────────────────────────────────────────────────

const loadPhase = createPhase<NormalizedRecord, LoadedRecord>('Load', {
    execute: async (input) => {
        const loaded: LoadedRecord = {
            ...input,
            loadedAt: new Date().toISOString(),
        };
        console.log(`  [Load] ✅ Record ${loaded.id} loaded: ${loaded.name} | ${loaded.tier} | $${loaded.amount} + $${loaded.bonus} bonus | ${loaded.region}`);
        return loaded;
    },
});

// ─── Build the Pipeline ──────────────────────────────────────────────────────

const etlProcess = createProcess('ETLPipeline', {
    phases: {
        extract: createPhaseNode('extract', extractPhase, {
            next: [createConnection('extract-to-validate', 'validate')],
        }),
        validate: createPhaseNode('validate', validatePhase, {
            next: [routingDecision],
        }),
        enrich: createPhaseNode('enrich', enrichPhase, {
            next: [createConnection('enrich-to-normalize', 'normalize')],
        }),
        normalize: createPhaseNode('normalize', normalizePhase, {
            next: [createConnection('normalize-to-load', 'load')],
        }),
        load: createPhaseNode('load', loadPhase, {
            next: createTermination('done', {
                terminate: async (output) => output,
            }),
        }),
    },
});

// ─── Event Handler for Observability ─────────────────────────────────────────

const loggingHandler = createEventHandler(async (_event, _context) => {
    // In production, log events here for observability:
    // console.log(`[${event.type}:${event.stage}] ${event.sourceId}`);
});

// ─── Run the Pipeline ────────────────────────────────────────────────────────

async function runETL() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Xenocline ETL Pipeline Example');
    console.log('═══════════════════════════════════════════════════\n');

    const context: ETLContext = {
        invalidRecords: [],
    } as ETLContext;

    let loadedCount = 0;
    let skippedCount = 0;

    for (const record of rawData) {
        console.log(`\n--- Processing record ${record.id} ---`);
        const beginning = createBeginning('begin', 'extract');

        try {
            const [results] = await executeProcess(etlProcess, beginning, {
                input: record,
                context,
                eventHandlers: [loggingHandler],
            });
            // Allow async terminations to settle
            await new Promise(resolve => setTimeout(resolve, 50));

            if (results['done']) {
                loadedCount++;
            }
            if (results['skipped']) {
                skippedCount++;
                context.invalidRecords.push(record.id);
            }
        } catch (error) {
            console.error(`  Error processing record ${record.id}:`, error);
        }
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ETL Pipeline Complete');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Records loaded:  ${loadedCount}`);
    console.log(`  Records skipped: ${skippedCount}`);
    console.log(`  Total processed: ${rawData.length}`);
    console.log();
}

runETL().catch(console.error);
