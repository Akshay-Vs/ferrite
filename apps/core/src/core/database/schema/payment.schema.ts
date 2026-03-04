import { sql } from 'drizzle-orm';
import {
	boolean,
	char,
	date,
	index,
	pgTable,
	timestamp,
	uniqueIndex,
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
		// Opaque provider reference (e.g. Stripe pm_xxx) — NOT a raw card token.
		// Safe to store in plaintext; the provider holds the sensitive material.
		providerPaymentMethodId: varchar('provider_payment_method_id', {
			length: 255,
		}).notNull(),
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

		// Unique partial: enforces one default payment method per user at the DB level
		uniqueIndex('uq_payment_methods_one_default_per_user')
			.on(t.userId)
			.where(sql`is_default = true`),

		// Expired card detection job: find cards to flag or notify about
		index('idx_payment_methods_expires_at').on(t.expiresAt),
	]
);

export type UserPaymentMethod = typeof userPaymentMethods.$inferSelect;
export type NewUserPaymentMethod = typeof userPaymentMethods.$inferInsert;
