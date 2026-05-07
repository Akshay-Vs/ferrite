import { IUseCase } from '@common/interfaces/use-case.interface';
import { Currency } from '@core/database/schema';
import { CurrencyAlreadyExistsError } from '../errors/currency-already-exists.error';
import { CurrencyInUseError } from '../errors/currency-in-use.error';
import { CurrencyNotFoundError } from '../errors/currency-not-found.error';
import { CreateCurrencyInput } from '../schemas/create-currency.zodschema';
import { GetCurrenciesInput } from '../schemas/get-currencies.zodschema';
import { UpdateCurrencyInput } from '../schemas/update-currency.zodschema';

export const CREATE_CURRENCY_UC = Symbol('CreateCurrencyUseCase');
export const DELETE_CURRENCY_UC = Symbol('DeleteCurrencyUseCase');
export const GET_CURRENCIES_UC = Symbol('GetCurrenciesUseCase');
export const UPDATE_CURRENCY_UC = Symbol('UpdateCurrencyUseCase');

/**
 * Creates a new currency.
 *
 * Called by the HTTP API.
 *
 * @input  CreateCurrencyInput - the currency to create
 * @output Currency - the created currency
 * @throws CurrencyAlreadyExistsError - if the currency already exists
 */
export type ICreateCurrencyUseCase = IUseCase<
	CreateCurrencyInput,
	Currency,
	CurrencyAlreadyExistsError | Error
>;

/**
 * Deletes a currency.
 *
 * Called by the HTTP API.
 *
 * @input  string - the currency code to delete
 * @output void
 * @throws CurrencyNotFoundError - if the currency does not exist
 */
export type IDeleteCurrencyUseCase = IUseCase<
	string,
	void,
	CurrencyNotFoundError | CurrencyInUseError | Error
>;

/**
 * Gets all active currencies.
 *
 * Called by the HTTP API.
 *
 * @input  GetCurrenciesInput
 * @output Currency[] - array of active currencies
 */
export type IGetCurrenciesUseCase = IUseCase<
	GetCurrenciesInput,
	Currency[],
	Error
>;

/**
 * Updates a currency.
 *
 * Called by the HTTP API.
 *
 * @input  UpdateCurrencyInput - the currency to update
 * @output Currency - the updated currency
 * @throws CurrencyNotFoundError - if the currency does not exist
 */
export type IUpdateCurrencyUseCase = IUseCase<
	UpdateCurrencyInput,
	Currency,
	CurrencyNotFoundError | Error
>;
