import type { Currency } from '@core/database/schema/currency.schema';
import type { CreateCurrencyInput } from '../schemas/create-currency.zodschema';
import type { UpdateCurrencyPayload } from '../schemas/update-currency.zodschema';

export const CURRENCY_REPOSITORY = Symbol('CURRENCY_REPOSITORY');

export interface ICurrencyRepository {
	/**
	 * Inserts a new currency record.
	 */
	create(input: CreateCurrencyInput): Promise<Currency>;

	/**
	 * Finds a single currency by its ISO 4217 code.
	 */
	findByCode(code: string): Promise<Currency | null>;

	/**
	 * Returns all currencies. When `activeOnly` is true, filters to `is_active = true`.
	 */
	findAll(activeOnly?: boolean): Promise<Currency[]>;

	/**
	 * Updates a currency by code. Returns `null` when the code does not exist.
	 */
	update(code: string, data: UpdateCurrencyPayload): Promise<Currency | null>;

	/**
	 * Hard-deletes a currency by code. Returns `false` when the code does not exist.
	 */
	delete(code: string): Promise<boolean>;
}
