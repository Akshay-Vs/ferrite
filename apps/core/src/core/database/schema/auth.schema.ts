import {
	boolean,
	index,
	pgTable,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { authProviderEnum } from './enum';
import { users } from './user.schema';

// ─────────────────────────────────────────
// AUTH PROVIDERS
// ─────────────────────────────────────────

export const userAuthProviders = pgTable(
	'user_auth_providers',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		provider: authProviderEnum('provider').notNull(),
		oauthProvider: varchar('oauth_provider', { length: 255 }),
		twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
		banned: boolean('banned').notNull().default(false),
		locked: boolean('locked').notNull().default(false),
		externalAuthId: varchar('external_auth_id', { length: 255 }).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Unique: one external ID per provider globally (no duplicate accounts)
		unique('uq_auth_provider_external').on(t.provider, t.externalAuthId),

		// Unique: one provider type per user (can't link Google twice)
		unique('uq_user_provider').on(t.userId, t.provider),

		// OAuth callback lookup — this is the hottest query in the auth flow:
		// "find user by provider + externalAuthId" on every OAuth sign-in
		index('idx_auth_providers_lookup').on(t.provider, t.externalAuthId),

		// Fetch all providers linked to a user (for "connected accounts" settings page)
		index('idx_auth_providers_user_id').on(t.userId),
	]
);
