import {
	boolean,
	index,
	pgTable,
	primaryKey,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { notificationChannelEnum, notificationTypeEnum } from './enum';
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
