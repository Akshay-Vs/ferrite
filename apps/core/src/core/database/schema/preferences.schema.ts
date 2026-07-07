import {
	boolean,
	index,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { notificationChannelEnum, notificationTypeEnum } from './enum';
import { stores } from './store.schema';
import { users } from './user.schema';

// ─────────────────────────────────────────
// NOTIFICATION PREFERENCES
// ─────────────────────────────────────────

export const userNotificationPreferences = pgTable(
	'user_notification_preferences',
	{
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		channel: notificationChannelEnum('channel').notNull(),
		type: notificationTypeEnum('type').notNull(),
		isEnabled: boolean('is_enabled').notNull().default(true),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Composite PK: one row per user + channel + type combination
		primaryKey({ columns: [t.userId, t.channel, t.type] }),

		// Before sending a campaign: "find all users who have opted in to
		// promotions via email" — channel + type is the filter, userId is the output
		index('idx_notif_prefs_channel_type_enabled').on(
			t.channel,
			t.type,
			t.isEnabled
		),
	]
);

export type UserNotificationPreference =
	typeof userNotificationPreferences.$inferSelect;
export type NewUserNotificationPreference =
	typeof userNotificationPreferences.$inferInsert;

export const storePreferences = pgTable('store_preferences', {
	storeId: uuid('store_id')
		.primaryKey()
		.references(() => stores.id, { onDelete: 'cascade' }),
	frontendUrl: varchar('frontend_url', { length: 255 }),
	htmlTemplate: varchar('html_template', { length: 255 }),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type StorePreference = typeof storePreferences.$inferSelect;
export type NewStorePreference = typeof storePreferences.$inferInsert;
