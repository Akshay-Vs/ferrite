import {
	boolean,
	index,
	jsonb,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { stores } from './store.schema';

export const storefrontUsers = pgTable(
	'storefront_users',
	{
		id: uuid('id').primaryKey(),
		storeId: uuid('store_id')
			.notNull()
			.references(() => stores.id, { onDelete: 'cascade' }),
		email: varchar('email', { length: 255 }).notNull(),
		emailVerified: boolean('email_verified').notNull().default(false),
		displayName: varchar('display_name', { length: 200 }),
		metadata: jsonb('metadata').default({}),

		lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Tenant isolation: email must be unique per store
		unique('uq_storefront_users_store_email').on(t.storeId, t.email),
		index('idx_storefront_users_store_id').on(t.storeId),
		index('idx_storefront_users_email').on(t.email),
		index('idx_storefront_users_created_at').on(t.createdAt),
	]
);

export type StorefrontUserTable = typeof storefrontUsers.$inferSelect;
export type NewStorefrontUserTable = typeof storefrontUsers.$inferInsert;
