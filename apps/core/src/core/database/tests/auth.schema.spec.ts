import { and, eq } from 'drizzle-orm';
import { userAuthProviders } from '../schema/auth.schema';
import { users } from '../schema/user.schema';
import { createTestAuthProvider, createTestUser } from './helpers';
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
// AUTH PROVIDERS
// ─────────────────────────────────────────

describe('userAuthProviders table', () => {
	it('should insert an auth provider for a user', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const [auth] = await db
			.insert(userAuthProviders)
			.values(createTestAuthProvider(user.id))
			.returning();

		expect(auth.userId).toBe(user.id);
		expect(auth.provider).toBe('clerk');
		expect(auth.externalAuthId).toBeDefined();
		expect(auth.createdAt).toBeInstanceOf(Date);
	});

	it('should reject duplicate provider per user (uq_user_provider)', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db
			.insert(userAuthProviders)
			.values(createTestAuthProvider(user.id, { externalAuthId: 'ext-aaa' }));

		// Same user + same provider ('clerk') but different external ID
		try {
			await db
				.insert(userAuthProviders)
				.values(createTestAuthProvider(user.id, { externalAuthId: 'ext-bbb' }));
			throw new Error('Should have thrown on duplicate user+provider');
		} catch (e: any) {
			expect(e.cause?.code).toBe('23505');
		}
	});

	it('should reject duplicate external ID per provider (uq_auth_provider_external)', async () => {
		const sharedExtId = `ext-shared-${Date.now()}`;

		const [user1] = await db.insert(users).values(createTestUser()).returning();

		await db
			.insert(userAuthProviders)
			.values(
				createTestAuthProvider(user1.id, { externalAuthId: sharedExtId })
			);

		// Different user, same provider + externalAuthId → should fail
		const [user2] = await db.insert(users).values(createTestUser()).returning();

		try {
			await db
				.insert(userAuthProviders)
				.values(
					createTestAuthProvider(user2.id, { externalAuthId: sharedExtId })
				);
			throw new Error(
				'Should have thrown on duplicate provider+externalAuthId'
			);
		} catch (e: any) {
			expect(e.cause?.code).toBe('23505');
		}
	});

	it('should cascade delete providers when user is deleted', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userAuthProviders).values(createTestAuthProvider(user.id));

		await db.delete(users).where(eq(users.id, user.id));

		const rows = await db
			.select()
			.from(userAuthProviders)
			.where(eq(userAuthProviders.userId, user.id));

		expect(rows).toHaveLength(0);
	});

	it('should look up by provider + externalAuthId', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const extId = `lookup-${Date.now()}`;
		await db
			.insert(userAuthProviders)
			.values(createTestAuthProvider(user.id, { externalAuthId: extId }));

		const [found] = await db
			.select()
			.from(userAuthProviders)
			.where(
				and(
					eq(userAuthProviders.provider, 'clerk'),
					eq(userAuthProviders.externalAuthId, extId)
				)
			);

		expect(found).toBeDefined();
		expect(found.userId).toBe(user.id);
	});
});
