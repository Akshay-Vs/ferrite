import {
	index,
	inet,
	pgTable,
	text,
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

// ─────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────

export const userSessions = pgTable(
	'user_sessions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		deviceType: varchar('device_type', { length: 50 }),
		ipAddress: inet('ip_address'),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	},
	(t) => [
		// "Show all active sessions" — used on every authenticated request
		// and on the security settings page
		index('idx_sessions_user_id').on(t.userId),

		// Session expiry cleanup job: find and delete expired sessions efficiently
		index('idx_sessions_expires_at').on(t.expiresAt),

		// Security audit: find all sessions from a suspicious IP address
		index('idx_sessions_ip_address').on(t.ipAddress),
	]
);
