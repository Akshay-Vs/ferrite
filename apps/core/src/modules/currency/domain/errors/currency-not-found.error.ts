export class CurrencyNotFoundError extends Error {
	readonly _tag = 'CurrencyNotFoundError';

	constructor(code: string) {
		super(`Currency ${code} not found`);
	}
}
