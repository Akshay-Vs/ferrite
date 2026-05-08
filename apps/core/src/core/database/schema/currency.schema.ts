import {
	boolean,
	char,
	decimal,
	index,
	integer,
	pgTable,
	primaryKey,
	timestamp,
	uniqueIndex,
	varchar,
} from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────
// CURRENCIES
// ─────────────────────────────────────────

export const currencies = pgTable(
	'currencies',
	{
		// ISO 4217 currency code (e.g. "USD", "JPY", "EUR")
		code: char('code', { length: 3 }).primaryKey(),
		// Graphical symbol (e.g. "$", "¥")
		symbol: varchar('symbol', { length: 10 }).notNull(),
		// Number of decimal sub-units (e.g. 2 for USD, 0 for JPY)
		decimalPrecision: integer('decimal_precision').notNull(),
		// Administrative toggle to globally enable/disable a currency
		isActive: boolean('is_active').notNull().default(true),
	},
	(t) => [
		// Rapid lookups during join operations
		uniqueIndex('uq_currencies_code').on(t.code),
	]
);

// ─────────────────────────────────────────
// EXCHANGE RATES
// ─────────────────────────────────────────

export const exchangeRates = pgTable(
	'exchange_rates',
	{
		fromCurrencyCode: char('from_currency_code', { length: 3 })
			.notNull()
			.references(() => currencies.code, { onDelete: 'cascade' }),
		toCurrencyCode: char('to_currency_code', { length: 3 })
			.notNull()
			.references(() => currencies.code, { onDelete: 'cascade' }),
		// High-precision decimal to prevent rounding errors in large-scale calculations
		rate: decimal('rate', { precision: 18, scale: 9 }).notNull(),
		// Tracks data freshness for caching policies
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Primary runtime index — conversion queries always filter by this pair
		primaryKey({ columns: [t.fromCurrencyCode, t.toCurrencyCode] }),
		index('idx_exchange_rates_from_to').on(
			t.fromCurrencyCode,
			t.toCurrencyCode
		),
	]
);

export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type NewExchangeRate = typeof exchangeRates.$inferInsert;
