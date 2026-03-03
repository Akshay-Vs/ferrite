import { sql } from 'drizzle-orm';
import {
	boolean,
	char,
	date,
	index,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { cardBrandEnum, paymentProviderEnum } from './enum';
import { users } from './user.schema';

// ─────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────

export const userPaymentMethods = pgTable(
	'user_payment_methods',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		provider: paymentProviderEnum('provider').notNull(),
		token: varchar('token', { length: 255 }).notNull(),
		cardLast4: char('card_last4', { length: 4 }),
		cardBrand: cardBrandEnum('card_brand'),
		expiresAt: date('expires_at'),
		isDefault: boolean('is_default').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Fetch saved cards at checkout — most frequent read on this table
		index('idx_payment_methods_user_id').on(t.userId),

		// Partial index: resolve the default card at checkout without
		// scanning all saved cards — only indexes the one row that matters
		index('idx_payment_methods_default')
			.on(t.userId)
			.where(sql`is_default = true`),

		// Expired card detection job: find cards to flag or notify about
		index('idx_payment_methods_expires_at').on(t.expiresAt),
	]
);

export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;
export type NewUserPaymentMethod = typeof userPaymentMethods.$inferInsert;
