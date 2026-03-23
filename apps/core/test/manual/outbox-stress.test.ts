/**
 * Outbox Stress Test
 *
 * Tests the full pipeline:
 *   INSERT → outbox_events → CDC listener → Redis/BullMQ queue
 *
 * Usage:
 *   bun stress-test-outbox.ts
 *   bun ts-node stress-test-outbox.ts --count=500 --concurrency=50 --queue=user-sync

 */

import { Pool } from 'pg';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

// ─── Config ──────────────────────────────────────────────────────────────────

const CONFIG = {
  databaseUrl: process.env.DATABASE_URL,
  redisHost: process.env.REDIS_HOST,
  redisPassword: process.env.REDIS_PASSWORD,
  redisPort: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  eventCount: parseArg('count', 50000),
  batchSize: parseArg('batch', 500),       // rows per INSERT batch
  concurrency: parseArg('concurrency', 50), // parallel batch inserts
  queueName: parseStringArg('queue', 'default'),
  aggregateType: parseStringArg('aggregate', 'User'),
  eventType: parseStringArg('event-type', 'TEST'),
  pollIntervalMs: 300,                    // how often to check Redis for new jobs
  timeoutMs: 30_000,                      // max wait for all events to appear in Redis
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseArg(name: string, fallback: number): number {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? parseInt(arg.split('=')[1], 10) : fallback;
}

function parseStringArg(name: string, fallback: string): string {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : fallback;
}

function log(symbol: string, msg: string) {
  console.log(`${symbol} ${msg}`);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ─── Event Generation ─────────────────────────────────────────────────────────

interface GeneratedEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  queueName: string;
  payload: Record<string, unknown>;
  maxRetries: number;
  traceContext: Record<string, string>;
}

function generateEvents(count: number): GeneratedEvent[] {
  return Array.from({ length: count }, () => {
    const id = randomUUID();
    return {
      id,
      aggregateId: randomUUID(),
      aggregateType: CONFIG.aggregateType,
      eventType: CONFIG.eventType,
      queueName: CONFIG.queueName,
      payload: {
        userId: randomUUID(),
        email: `stress-test-${id.slice(0, 8)}@test.com`,
        deletedAt: new Date().toISOString(),
        __stressTest: true,
      },
      maxRetries: 5,
      traceContext: {
        'traceparent': `00-${id.replace(/-/g, '')}-${randomUUID().replace(/-/g, '').slice(0, 16)}-01`,
      },
    };
  });
}

// ─── Database Insertion ───────────────────────────────────────────────────────

async function insertBatch(pool: Pool, events: GeneratedEvent[]): Promise<void> {
  if (events.length === 0) return;

  // Build a single multi-row INSERT for the batch
  const values: unknown[] = [];
  const placeholders = events.map((e, i) => {
    const base = i * 8;
    values.push(
      e.id,
      e.aggregateId,
      e.aggregateType,
      e.eventType,
      e.queueName,
      JSON.stringify(e.payload),
      e.maxRetries,
      JSON.stringify(e.traceContext),
    );
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
  });

  await pool.query(
    `INSERT INTO outbox_events
       (id, aggregate_id, aggregate_type, event_type, queue_name, payload, max_retries, trace_context)
     VALUES ${placeholders.join(', ')}`,
    values
  );
}

async function insertAllEvents(
  pool: Pool,
  events: GeneratedEvent[],
): Promise<{ durationMs: number }> {
  const batches = chunk(events, CONFIG.batchSize);
  const semaphore: Promise<void>[] = [];
  let completed = 0;

  const start = Date.now();

  // Run up to CONFIG.concurrency batches in parallel
  for (const batch of batches) {
    const p = insertBatch(pool, batch).then(() => {
      completed += batch.length;
      process.stdout.write(`\r  ↳ Inserted ${completed}/${events.length} rows...`);
    });
    semaphore.push(p);

    if (semaphore.length >= CONFIG.concurrency) {
      await Promise.all(semaphore.splice(0));
    }
  }

  await Promise.all(semaphore);
  process.stdout.write('\n');

  return { durationMs: Date.now() - start };
}

// ─── Redis Verification ───────────────────────────────────────────────────────

/**
 * BullMQ stores jobs in Redis under keys like:
 *   bull:<queueName>:jobId   (the job data)
 *
 * We use SCAN to find all job keys for our queue and match against
 * the jobIds we inserted (outbox event UUIDs).
 */
async function getRedisJobIds(redis: Redis, queueName: string): Promise<Set<string>> {
  const jobIds = new Set<string>();
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH', `bull:${queueName}:*`,
      'COUNT', '200',
    );
    cursor = nextCursor;

    for (const key of keys) {
      // key format: bull:<queue>:<jobId>
      const parts = key.split(':');
      const jobId = parts.slice(2).join(':'); // handle UUIDs with colons
      if (jobId) jobIds.add(jobId);
    }
  } while (cursor !== '0');

  return jobIds;
}

async function pollUntilAllEnqueued(
  redis: Redis,
  expectedIds: Set<string>,
  timeoutMs: number,
): Promise<{ found: Set<string>; missing: Set<string>; durationMs: number }> {
  const start = Date.now();
  let found = new Set<string>();

  while (Date.now() - start < timeoutMs) {
    found = await getRedisJobIds(redis, CONFIG.queueName);

    const matched = new Set([...expectedIds].filter(id => found.has(id)));
    const missing = new Set([...expectedIds].filter(id => !found.has(id)));

    process.stdout.write(
      `\r  ↳ Detected in Redis: ${matched.size}/${expectedIds.size} jobs...`
    );

    if (missing.size === 0) {
      process.stdout.write('\n');
      return { found: matched, missing, durationMs: Date.now() - start };
    }

    await sleep(CONFIG.pollIntervalMs);
  }

  process.stdout.write('\n');
  const missing = new Set([...expectedIds].filter(id => !found.has(id)));
  return { found, missing, durationMs: Date.now() - start };
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanup(pool: Pool, redis: Redis, eventIds: string[]) {
  log('🧹', 'Cleaning up test data...');

  // Remove from outbox
  await pool.query(
    `DELETE FROM outbox_events WHERE id = ANY($1::uuid[])`,
    [eventIds]
  );

  // Remove BullMQ jobs from Redis
  const pipeline = redis.pipeline();
  for (const id of eventIds) {
    pipeline.del(`bull:${CONFIG.queueName}:${id}`);
  }
  await pipeline.exec();

  log('✓', 'Cleanup complete');
}

// ─── Report ───────────────────────────────────────────────────────────────────

function printReport(params: {
  eventCount: number;
  insertDurationMs: number;
  propagationDurationMs: number;
  found: number;
  missing: number;
  missingIds: string[];
}) {
  const {
    eventCount,
    insertDurationMs,
    propagationDurationMs,
    found,
    missing,
    missingIds,
  } = params;

  const insertRate = (eventCount / (insertDurationMs / 1000)).toFixed(1);
  const allFound = missing === 0;

  console.log('\n══════════════════════════════════════════════');
  console.log('  OUTBOX STRESS TEST REPORT');
  console.log('══════════════════════════════════════════════');
  console.log(`  Events inserted    : ${eventCount}`);
  console.log(`  Batch size         : ${CONFIG.batchSize}`);
  console.log(`  Concurrency        : ${CONFIG.concurrency}`);
  console.log(`  Queue              : ${CONFIG.queueName}`);
  console.log('──────────────────────────────────────────────');
  console.log(`  Insert duration    : ${insertDurationMs}ms (${insertRate} rows/s)`);
  console.log(`  Propagation time   : ${propagationDurationMs}ms`);
  console.log(`  Jobs found         : ${found}/${eventCount}`);
  console.log(`  Jobs missing       : ${missing}`);
  console.log('──────────────────────────────────────────────');
  console.log(`  Result             : ${allFound ? '✅ PASS' : '❌ FAIL'}`);

  if (missingIds.length > 0) {
    console.log('\n  Missing job IDs (first 10):');
    missingIds.slice(0, 10).forEach(id => console.log(`    - ${id}`));
  }

  console.log('══════════════════════════════════════════════\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Outbox CDC Stress Test');
  console.log(`   ${CONFIG.eventCount} events → ${CONFIG.queueName} queue\n`);

  const pool = new Pool({ connectionString: CONFIG.databaseUrl });
  const redis = new Redis({
    host: CONFIG.redisHost,
    password: CONFIG.redisPassword,
    port: CONFIG.redisPort,
  });

  redis.on('error', err => log('✗', `Redis error: ${err.message}`));

  try {
    // 1. Verify connections
    log('⏳', 'Connecting to Postgres...');
    await pool.query('SELECT 1');
    log('✓', 'Postgres connected');

    log('⏳', 'Connecting to Redis...');
    await redis.ping();
    log('✓', 'Redis connected\n');

    // 2. Generate events
    log('⏳', `Generating ${CONFIG.eventCount} events...`);
    const events = generateEvents(CONFIG.eventCount);
    const eventIds = new Set(events.map(e => e.id));
    log('✓', `Generated ${events.length} events\n`);

    // 3. Insert into outbox
    log('⏳', 'Inserting into outbox_events...');
    const { durationMs: insertDurationMs } = await insertAllEvents(pool, events);
    log('✓', `Inserted ${events.length} rows in ${insertDurationMs}ms\n`);

    // 4. Poll Redis until all jobs appear (CDC → BullMQ propagation)
    log('⏳', `Polling Redis for jobs (timeout: ${CONFIG.timeoutMs / 1000}s)...`);
    const { found, missing, durationMs: propagationDurationMs } =
      await pollUntilAllEnqueued(redis, eventIds, CONFIG.timeoutMs);

    // 5. Report
    printReport({
      eventCount: CONFIG.eventCount,
      insertDurationMs,
      propagationDurationMs,
      found: found.size,
      missing: missing.size,
      missingIds: [...missing],
    });

    // 6. Cleanup
    await cleanup(pool, redis, [...eventIds]);

    process.exitCode = missing.size === 0 ? 0 : 1;
  } catch (err) {
    log('✗', `Fatal error: ${(err as Error).message}`);
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
    await redis.quit();
  }
}

main();
