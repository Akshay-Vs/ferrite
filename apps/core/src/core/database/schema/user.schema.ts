import { sql } from 'drizzle-orm';
import {
	boolean,
	char,
	date,
	index,
	pgTable,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { addressTypeEnum } from './enum';

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────

export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		email: varchar('email', { length: 255 }).notNull().unique(),
		emailVerified: boolean('email_verified').notNull().default(false),
		avatarUrl: varchar('avatar_url', { length: 2048 }),
		firstName: varchar('first_name', { length: 100 }),
		lastName: varchar('last_name', { length: 100 }),
		dateOfBirth: date('date_of_birth'),
		preferredLocale: varchar('preferred_locale', { length: 10 }).default(
			'en-US'
		),
		preferredCurrency: char('preferred_currency', { length: 3 }).default('USD'),
		isActive: boolean('is_active').notNull().default(true),
		isBanned: boolean('is_banned').notNull().default(false),
		banReason: varchar('ban_reason', { length: 500 }),
		lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
	},
	(t) => [
		index('idx_users_is_active').on(t.isActive),
		index('idx_users_is_banned').on(t.isBanned),
		index('idx_users_deleted_at')
			.on(t.deletedAt)
			.where(sql`deleted_at IS NOT NULL`),
		index('idx_users_created_at').on(t.createdAt),
		index('idx_users_last_login_at').on(t.lastLoginAt),
	]
);

// ─────────────────────────────────────────
// PHONES
// ─────────────────────────────────────────

export const userPhones = pgTable(
	'user_phones',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		phone: varchar('phone', { length: 20 }).notNull(),
		countryCode: varchar('country_code', { length: 5 }).notNull(),
		phoneVerified: boolean('phone_verified').notNull().default(false),
		isDefault: boolean('is_default').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		unique('uq_phone_country').on(t.countryCode, t.phone),
		index('idx_phones_user_id').on(t.userId),
		uniqueIndex('idx_phones_default')
			.on(t.userId)
			.where(sql`is_default = true`),
	]
);

// ─────────────────────────────────────────
// ADDRESSES
// ─────────────────────────────────────────

export const userAddresses = pgTable(
	'user_addresses',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),

		// Human-readable label shown in checkout dropdown ("Home", "Office")
		label: varchar('label', { length: 100 }),
		type: addressTypeEnum('type').notNull().default('home'),

		// Name on the address — can differ from the account holder
		// (e.g. shipping to a family member or a business contact)
		firstName: varchar('first_name', { length: 100 }).notNull(),
		lastName: varchar('last_name', { length: 100 }).notNull(),
		company: varchar('company', { length: 150 }),

		phone: varchar('phone', { length: 20 }),
		countryCode: varchar('country_code', { length: 5 }),

		line1: varchar('line1', { length: 255 }).notNull(),
		line2: varchar('line2', { length: 255 }),
		city: varchar('city', { length: 100 }).notNull(),
		state: varchar('state', { length: 100 }),
		postalCode: varchar('postal_code', { length: 20 }).notNull(),

		country: char('country', { length: 2 }).notNull(), // US, IN

		isPrimary: boolean('is_primary').notNull().default(false),

		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		index('idx_addresses_user_id').on(t.userId),

		// Partial unique: enforces one primary address per user at the DB level
		uniqueIndex('uq_addresses_one_primary_per_user')
			.on(t.userId)
			.where(sql`is_primary = true`),

		// Shipping zone validation
		index('idx_addresses_country').on(t.country),
		index('idx_addresses_user_type').on(t.userId, t.type),
	]
);

// ─────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserPhone = typeof userPhones.$inferSelect;
export type NewUserPhone = typeof userPhones.$inferInsert;
export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;
