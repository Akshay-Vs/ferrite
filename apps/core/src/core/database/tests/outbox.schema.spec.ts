import { randomUUID } from 'crypto';
import { outboxEvents } from '../schema';
import { cleanupTables, db, setupTestDB, teardownTestDB } from './setup';

describe('outbox_events table', () => {
	beforeAll(async () => {
		await setupTestDB();
	});

	beforeEach(async () => {
		await cleanupTables();
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	it('should insert an outbox event with defaults', async () => {
		const result = await db
			.insert(outboxEvents)
			.values({
				aggregateId: randomUUID(),
				aggregateType: 'user',
				eventType: 'user.created',
				payload: { id: 'test', name: 'tester' },
			})
			.returning();

		expect(result).toHaveLength(1);
		const event = result[0]!;

		expect(event.id).toBeDefined();
		expect(event.aggregateType).toBe('user');
		expect(event.eventType).toBe('user.created');
		expect(event.payload).toEqual({ id: 'test', name: 'tester' });

		// Check defaults
		expect(event.status).toBe('pending');
		expect(event.retryCount).toBe(0);
		expect(event.maxRetries).toBe(5);
		expect(event.createdAt).toBeInstanceOf(Date);

		// Nullable fields
		expect(event.processedAt).toBeNull();
		expect(event.lockedAt).toBeNull();
		expect(event.notifySentAt).toBeNull();
		expect(event.errorDetail).toBeNull();
	});

	it('should allow overriding defaults on insert', async () => {
		const lockTime = new Date();
		const result = await db
			.insert(outboxEvents)
			.values({
				aggregateId: randomUUID(),
				aggregateType: 'user',
				eventType: 'user.updated',
				payload: {},
				status: 'processing',
				retryCount: 1,
				maxRetries: 3,
				lockedAt: lockTime,
			})
			.returning();

		const event = result[0]!;
		expect(event.status).toBe('processing');
		expect(event.retryCount).toBe(1);
		expect(event.maxRetries).toBe(3);
		expect(event.lockedAt).toEqual(lockTime);
	});
});
