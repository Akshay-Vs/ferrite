export class CurrencyAlreadyExistsError extends Error {
	readonly _tag = 'CurrencyAlreadyExistsError';

	constructor(code: string) {
		super(`Currency ${code} already exists`);
	}
}
