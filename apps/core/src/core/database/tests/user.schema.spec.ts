import { eq } from 'drizzle-orm';
import { userAddresses, userPhones, users } from '../schema/user.schema';
import { createTestAddress, createTestPhone, createTestUser } from './helpers';
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
// USERS
// ─────────────────────────────────────────

describe('users table', () => {
	it('should insert a user with only required fields and apply defaults', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		expect(user.id).toBeDefined();
		expect(user.emailVerified).toBe(false);
		expect(user.isActive).toBe(true);
		expect(user.isBanned).toBe(false);
		expect(user.createdAt).toBeInstanceOf(Date);
		expect(user.updatedAt).toBeInstanceOf(Date);
		expect(user.deletedAt).toBeNull();
	});

	it('should insert a user with all optional fields', async () => {
		const [user] = await db
			.insert(users)
			.values(
				createTestUser({
					firstName: 'John',
					lastName: 'Doe',
					dateOfBirth: '1990-01-15',
					avatarUrl: 'https://example.com/avatar.png',
					preferredLocale: 'en-GB',
					preferredCurrency: 'GBP',
				})
			)
			.returning();

		expect(user.firstName).toBe('John');
		expect(user.lastName).toBe('Doe');
		expect(user.dateOfBirth).toBe('1990-01-15');
		expect(user.preferredLocale).toBe('en-GB');
		expect(user.preferredCurrency).toBe('GBP');
	});

	it('should reject duplicate email', async () => {
		const email = `dup-${Date.now()}@example.com`;
		await db.insert(users).values(createTestUser({ email }));

		let caughtError: any;
		try {
			await db.insert(users).values(createTestUser({ email }));
		} catch (e) {
			caughtError = e;
		}
		expect(caughtError?.cause?.code).toBe('23505');
	});

	it('should update lastLoginAt', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const now = new Date();
		const [updated] = await db
			.update(users)
			.set({ lastLoginAt: now })
			.where(eq(users.id, user.id))
			.returning();

		expect(updated.lastLoginAt).toEqual(now);
	});

	it('should soft-delete via deletedAt', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const now = new Date();
		await db.update(users).set({ deletedAt: now }).where(eq(users.id, user.id));

		const [found] = await db.select().from(users).where(eq(users.id, user.id));

		expect(found.deletedAt).toEqual(now);
	});

	it('should delete a user', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.delete(users).where(eq(users.id, user.id));

		const rows = await db.select().from(users).where(eq(users.id, user.id));

		expect(rows).toHaveLength(0);
	});
});

// ─────────────────────────────────────────
// PHONES
// ─────────────────────────────────────────

describe('userPhones table', () => {
	it('should insert a phone with defaults', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const [phone] = await db
			.insert(userPhones)
			.values(createTestPhone(user.id))
			.returning();

		expect(phone.userId).toBe(user.id);
		expect(phone.phoneVerified).toBe(false);
		expect(phone.isDefault).toBe(false);
		expect(phone.createdAt).toBeInstanceOf(Date);
	});

	it('should reject duplicate phone (same country + number)', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const phoneData = { phone: '5551234567', countryCode: '+1' };

		await db.insert(userPhones).values(createTestPhone(user.id, phoneData));

		// Same phone+country for a different user should also fail
		const [user2] = await db.insert(users).values(createTestUser()).returning();

		let caughtError: any;
		try {
			await db.insert(userPhones).values(createTestPhone(user2.id, phoneData));
		} catch (e) {
			caughtError = e;
		}
		expect(caughtError?.cause?.code).toBe('23505');
	});

	it('should cascade delete phones when user is deleted', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userPhones).values(createTestPhone(user.id));

		// Delete the user
		await db.delete(users).where(eq(users.id, user.id));

		const phones = await db
			.select()
			.from(userPhones)
			.where(eq(userPhones.userId, user.id));

		expect(phones).toHaveLength(0);
	});
});

// ─────────────────────────────────────────
// ADDRESSES
// ─────────────────────────────────────────

describe('userAddresses table', () => {
	it('should insert an address with defaults', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const [addr] = await db
			.insert(userAddresses)
			.values(createTestAddress(user.id))
			.returning();

		expect(addr.userId).toBe(user.id);
		expect(addr.isPrimary).toBe(false);
		expect(addr.type).toBe('home');
		expect(addr.createdAt).toBeInstanceOf(Date);
		expect(addr.updatedAt).toBeInstanceOf(Date);
	});

	it('should cascade delete addresses when user is deleted', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db.insert(userAddresses).values(createTestAddress(user.id));

		await db.delete(users).where(eq(users.id, user.id));

		const addrs = await db
			.select()
			.from(userAddresses)
			.where(eq(userAddresses.userId, user.id));

		expect(addrs).toHaveLength(0);
	});
});
