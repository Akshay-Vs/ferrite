import {
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────
// INBOX EVENTS
// ─────────────────────────────────────────

export const inboxEvents = pgTable(
	'inbox_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),

		// Deduplication key — globally unique per source + message
		eventId: text('message_id').notNull(),

		// Origin of the incoming event (e.g. 'clerk', 'stripe')
		provider: text('source').notNull(),
		aggregateType: text('aggregate_type').notNull(),
		eventType: text('event_type').notNull(),
		payload: jsonb('payload').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Global deduplication: same message from the same source is never processed twice
		unique('uq_inbox_provider_event_id').on(t.provider, t.eventId),
	]
);

// ─────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────

export type NewInboxEvent = typeof inboxEvents.$inferInsert;
export type InboxEventRow = typeof inboxEvents.$inferSelect;
export type InboxEvent<
	T extends Record<string, unknown> = Record<string, unknown>,
> =
	| (Omit<NewInboxEvent, 'id' | 'createdAt' | 'payload'> & { payload: T }) // write
	| (Omit<InboxEventRow, 'payload'> & { payload: T }); // read
