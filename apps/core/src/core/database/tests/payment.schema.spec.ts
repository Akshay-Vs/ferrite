import { eq } from 'drizzle-orm';
import { userPaymentMethods } from '../schema/payment.schema';
import { users } from '../schema/user.schema';
import { createTestPaymentMethod, createTestUser } from './helpers';
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
// PAYMENT METHODS
// ─────────────────────────────────────────

describe('userPaymentMethods table', () => {
	it('should insert a payment method for a user', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		const [paymentMethod] = await db
			.insert(userPaymentMethods)
			.values(createTestPaymentMethod(user.id))
			.returning();

		expect(paymentMethod.userId).toBe(user.id);
		expect(paymentMethod.provider).toBe('stripe');
		expect(paymentMethod.providerPaymentMethodId).toBeDefined();
		expect(paymentMethod.isDefault).toBe(false);
	});

	it('should enforce exactly one default payment method per user (uq_payment_methods_one_default_per_user)', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db
			.insert(userPaymentMethods)
			.values(createTestPaymentMethod(user.id, { isDefault: true }));

		// Second default for the same user should fail
		try {
			await db
				.insert(userPaymentMethods)
				.values(createTestPaymentMethod(user.id, { isDefault: true }));
			throw new Error('Should have thrown on multiple defaults');
		} catch (e: any) {
			expect(e.cause?.code).toBe('23505');
		}
	});

	it('should allow multiple non-default payment methods for the same user', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db
			.insert(userPaymentMethods)
			.values(createTestPaymentMethod(user.id, { isDefault: false }));

		await db
			.insert(userPaymentMethods)
			.values(createTestPaymentMethod(user.id, { isDefault: false }));

		const rows = await db
			.select()
			.from(userPaymentMethods)
			.where(eq(userPaymentMethods.userId, user.id));

		expect(rows).toHaveLength(2);
	});

	it('should cascade delete payment methods when user is deleted', async () => {
		const [user] = await db.insert(users).values(createTestUser()).returning();

		await db
			.insert(userPaymentMethods)
			.values(createTestPaymentMethod(user.id));

		await db.delete(users).where(eq(users.id, user.id));

		const rows = await db
			.select()
			.from(userPaymentMethods)
			.where(eq(userPaymentMethods.userId, user.id));

		expect(rows).toHaveLength(0);
	});
});
