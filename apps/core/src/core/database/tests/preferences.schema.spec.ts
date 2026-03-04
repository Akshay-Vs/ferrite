import { eq } from 'drizzle-orm';
import { userNotificationPreferences } from '../schema/preferences.schema';
import { users } from '../schema/user.schema';
import { createTestNotificationPreference, createTestUser } from './helpers';
import { cleanupTables, db, setupTestDB, teardownTestDB } from './setup';

beforeAll(async () => {
	await setupTestDB();
});

afterAll(async () => {
	await teardownTestDB();
});

beforeEach(async () => {
	await cleanupTables();
});

// ─────────────────────────────────────────
// NOTIFICATION PREFERENCES
// ─────────────────────────────────────────

describe('userNotificationPreferences table', () => {
	it('should insert a notification preference for a user', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const [preference] = await db
			.insert(userNotificationPreferences)
			.values(createTestNotificationPreference(user.id))
			.returning();

		expect(preference.userId).toBe(user.id);
		expect(preference.channel).toBe('email');
		expect(preference.type).toBe('promotions');
		expect(preference.isEnabled).toBe(true);
	});

	it('should enforce unique preference per user + channel + type (composite primary key)', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userNotificationPreferences).values(
			createTestNotificationPreference(user.id, {
				channel: 'email',
				type: 'order_updates',
			})
		);

		try {
			await db.insert(userNotificationPreferences).values(
				createTestNotificationPreference(user.id, {
					channel: 'email',
					type: 'order_updates',
				})
			);
			throw new Error('Should have thrown on duplicate user+channel+type');
		} catch (e: any) {
			expect(e.cause?.code).toBe('23505');
		}
	});

	it('should cascade delete preferences when user is deleted', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db
			.insert(userNotificationPreferences)
			.values(createTestNotificationPreference(user.id));

		await db.delete(users).where(eq(users.id, user.id));

		const rows = await db
			.select()
			.from(userNotificationPreferences)
			.where(eq(userNotificationPreferences.userId, user.id));

		expect(rows).toHaveLength(0);
	});
});
