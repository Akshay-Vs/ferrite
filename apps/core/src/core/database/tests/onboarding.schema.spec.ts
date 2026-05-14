import { eq } from 'drizzle-orm';
import { userOnboarding } from '../schema/onboarding.schema';
import { users } from '../schema/user.schema';
import { createTestUser } from './helpers';
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
// USER ONBOARDING
// ─────────────────────────────────────────

describe('user_onboarding table', () => {
	it('should insert an onboarding row with defaults', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const [row] = await db
			.insert(userOnboarding)
			.values({ userId: user.id })
			.returning();

		expect(row.userId).toBe(user.id);
		expect(row.state).toBe('ABOUT_ME');
		expect(row.isCompleted).toBe(false);
		expect(row.stepData).toEqual({});
		expect(row.completedAt).toBeNull();
		expect(row.updatedAt).toBeInstanceOf(Date);
	});

	it('should enforce one onboarding row per user (PK on user_id)', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userOnboarding).values({ userId: user.id });

		try {
			await db.insert(userOnboarding).values({ userId: user.id });
			throw new Error('Should have thrown on duplicate user_id');
		} catch (e: any) {
			expect(e.cause?.code).toBe('23505');
		}
	});

	it('should update state through onboarding steps', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userOnboarding).values({ userId: user.id });

		const [updated] = await db
			.update(userOnboarding)
			.set({ state: 'STORE_CREATION' })
			.where(eq(userOnboarding.userId, user.id))
			.returning();

		expect(updated.state).toBe('STORE_CREATION');
	});

	it('should mark onboarding as completed', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userOnboarding).values({ userId: user.id });

		const now = new Date();
		const [completed] = await db
			.update(userOnboarding)
			.set({
				state: 'COMPLETED',
				isCompleted: true,
				completedAt: now,
			})
			.where(eq(userOnboarding.userId, user.id))
			.returning();

		expect(completed.state).toBe('COMPLETED');
		expect(completed.isCompleted).toBe(true);
		expect(completed.completedAt).toEqual(now);
	});

	it('should store and retrieve stepData as jsonb', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const stepData = {
			aboutMe: { firstName: 'Test', lastName: 'User' },
			storeSetup: { name: 'My Store' },
		};

		const [row] = await db
			.insert(userOnboarding)
			.values({ userId: user.id, stepData })
			.returning();

		expect(row.stepData).toEqual(stepData);
	});

	it('should cascade delete onboarding when user is deleted', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userOnboarding).values({ userId: user.id });

		await db.delete(users).where(eq(users.id, user.id));

		const rows = await db
			.select()
			.from(userOnboarding)
			.where(eq(userOnboarding.userId, user.id));

		expect(rows).toHaveLength(0);
	});
});
