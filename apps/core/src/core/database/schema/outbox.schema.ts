import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────
// OUTBOX EVENTS
// ─────────────────────────────────────────

export const outboxEvents = pgTable(
	'outbox_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		aggregateId: uuid('aggregate_id').notNull(),
		aggregateType: text('aggregate_type').notNull(),
		eventType: text('event_type').notNull(),
		payload: jsonb('payload').notNull(),
		status: text('status').notNull().default('pending'),
		retryCount: integer('retry_count').notNull().default(0),
		maxRetries: integer('max_retries').notNull().default(5),
		errorDetail: text('error_detail'),

		// Scheduled job
		scheduledAt: timestamp('scheduled_at', { withTimezone: true })
			.notNull()
			.defaultNow(),

		// Claiming mechanism
		lockedAt: timestamp('locked_at', { withTimezone: true }),

		// Completion
		processedAt: timestamp('processed_at', { withTimezone: true }),

		// Observability only — never gates processing logic
		notifySentAt: timestamp('notify_sent_at', { withTimezone: true }),

		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		index('idx_outbox_pending')
			.on(t.createdAt)
			.where(sql`processed_at IS NULL`),
	]
);

// ─────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────

export type NewOutboxEvent = typeof outboxEvents.$inferInsert;
export type OutboxEvent<
	T extends Record<string, unknown> = Record<string, unknown>,
> = Omit<NewOutboxEvent, 'id' | 'createdAt' | 'payload'> & {
	payload: T;
};
