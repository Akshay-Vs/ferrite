import { sql } from 'drizzle-orm';
import {
	boolean,
	index,
	jsonb,
	pgTable,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import { onboardingStateEnum } from './enum';
import { users } from './user.schema';

// ─────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────

export const userOnboarding = pgTable(
	'user_onboarding',
	{
		userId: uuid('user_id')
			.primaryKey()
			.references(() => users.id, { onDelete: 'cascade' }),
		state: onboardingStateEnum('state').notNull().default('ABOUT_ME'),
		isCompleted: boolean('is_completed').notNull().default(false),
		stepData: jsonb('step_data').default(sql`'{}'::jsonb`),
		completedAt: timestamp('completed_at', { withTimezone: true }),
		updatedAt: timestamp('updated_at', { withTimezone: true }).default(
			sql`CURRENT_TIMESTAMP`
		),
	},
	(t) => [
		index('idx_user_onboarding_state').on(t.state),
		index('idx_user_onboarding_is_completed').on(t.isCompleted),
	]
);

export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type NewUserOnboarding = typeof userOnboarding.$inferInsert;
