import { eq } from 'drizzle-orm';
import { currencies, exchangeRates } from '../schema/currency.schema';
import { createTestCurrency, createTestExchangeRate } from './helpers';
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
// CURRENCIES
// ─────────────────────────────────────────

describe('currencies table', () => {
	it('should insert an active currency', async () => {
		const [currency] = await db
			.insert(currencies)
			.values(createTestCurrency())
			.returning();

		expect(currency.code).toBe('USD');
		expect(currency.symbol).toBe('$');
		expect(currency.decimalPrecision).toBe(2);
		expect(currency.isActive).toBe(true);
	});

	it('should insert a zero-precision currency (e.g. JPY)', async () => {
		const [currency] = await db
			.insert(currencies)
			.values(
				createTestCurrency({ code: 'JPY', symbol: '¥', decimalPrecision: 0 })
			)
			.returning();

		expect(currency.code).toBe('JPY');
		expect(currency.decimalPrecision).toBe(0);
	});

	it('should default isActive to true', async () => {
		const [currency] = await db
			.insert(currencies)
			.values({ code: 'EUR', symbol: '€', decimalPrecision: 2 })
			.returning();

		expect(currency.isActive).toBe(true);
	});

	it('should allow setting isActive to false', async () => {
		const [currency] = await db
			.insert(currencies)
			.values(createTestCurrency({ isActive: false }))
			.returning();

		expect(currency.isActive).toBe(false);
	});

	it('should enforce unique code (uq_currencies_code)', async () => {
		await db.insert(currencies).values(createTestCurrency());

		try {
			await db.insert(currencies).values(createTestCurrency());
			throw new Error('Should have thrown on duplicate code');
		} catch (e: any) {
			expect(e.cause?.code).toBe('23505');
		}
	});
});

// ─────────────────────────────────────────
// EXCHANGE RATES
// ─────────────────────────────────────────

describe('exchangeRates table', () => {
	it('should insert an exchange rate between two currencies', async () => {
		const [usd] = await db
			.insert(currencies)
			.values(createTestCurrency())
			.returning();
		const [eur] = await db
			.insert(currencies)
			.values(
				createTestCurrency({ code: 'EUR', symbol: '€', decimalPrecision: 2 })
			)
			.returning();

		const [rate] = await db
			.insert(exchangeRates)
			.values(createTestExchangeRate(usd.code, eur.code))
			.returning();

		expect(rate.fromCurrencyCode).toBe('USD');
		expect(rate.toCurrencyCode).toBe('EUR');
		expect(parseFloat(rate.rate)).toBeCloseTo(0.92);
		expect(rate.updatedAt).toBeDefined();
	});

	it('should support high-precision rates (18,9)', async () => {
		const [usd] = await db
			.insert(currencies)
			.values(createTestCurrency())
			.returning();
		const [jpy] = await db
			.insert(currencies)
			.values(
				createTestCurrency({ code: 'JPY', symbol: '¥', decimalPrecision: 0 })
			)
			.returning();

		const [rate] = await db
			.insert(exchangeRates)
			.values(createTestExchangeRate(usd.code, jpy.code, '149.123456789'))
			.returning();

		// Precision should be preserved (up to 9 decimal places)
		expect(parseFloat(rate.rate)).toBeCloseTo(149.123456789, 6);
	});

	it('should reject an exchange rate with an unknown fromCurrencyCode (FK violation)', async () => {
		try {
			await db
				.insert(exchangeRates)
				.values(createTestExchangeRate('ZZZ', 'USD', '1.0'));
			throw new Error('Should have thrown on invalid FK');
		} catch (e: any) {
			expect(e.cause?.code).toBe('23503');
		}
	});

	it('should reject an exchange rate with an unknown toCurrencyCode (FK violation)', async () => {
		const [usd] = await db
			.insert(currencies)
			.values(createTestCurrency())
			.returning();

		try {
			await db
				.insert(exchangeRates)
				.values(createTestExchangeRate(usd.code, 'ZZZ', '1.0'));
			throw new Error('Should have thrown on invalid FK');
		} catch (e: any) {
			expect(e.cause?.code).toBe('23503');
		}
	});

	it('should allow multiple rates from the same source currency', async () => {
		const [usd] = await db
			.insert(currencies)
			.values(createTestCurrency())
			.returning();
		const [eur] = await db
			.insert(currencies)
			.values(
				createTestCurrency({ code: 'EUR', symbol: '€', decimalPrecision: 2 })
			)
			.returning();
		const [gbp] = await db
			.insert(currencies)
			.values(
				createTestCurrency({ code: 'GBP', symbol: '£', decimalPrecision: 2 })
			)
			.returning();

		await db
			.insert(exchangeRates)
			.values(createTestExchangeRate(usd.code, eur.code));
		await db
			.insert(exchangeRates)
			.values(createTestExchangeRate(usd.code, gbp.code, '0.79'));

		const rates = await db
			.select()
			.from(exchangeRates)
			.where(eq(exchangeRates.fromCurrencyCode, usd.code));

		expect(rates).toHaveLength(2);
	});

	it('should cascade delete rates when a referenced currency is deleted', async () => {
		const [usd] = await db
			.insert(currencies)
			.values(createTestCurrency())
			.returning();
		const [eur] = await db
			.insert(currencies)
			.values(
				createTestCurrency({ code: 'EUR', symbol: '€', decimalPrecision: 2 })
			)
			.returning();

		await db
			.insert(exchangeRates)
			.values(createTestExchangeRate(usd.code, eur.code));

		// Delete the source currency — rates must be removed via cascade
		await db.delete(currencies).where(eq(currencies.code, usd.code));

		const remaining = await db
			.select()
			.from(exchangeRates)
			.where(eq(exchangeRates.fromCurrencyCode, 'USD'));

		expect(remaining).toHaveLength(0);
	});
});
