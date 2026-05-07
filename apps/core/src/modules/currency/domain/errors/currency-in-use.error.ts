export class CurrencyInUseError extends Error {
	constructor(code: string) {
		super(
			`Currency with code "${code}" cannot be deleted because it is currently referenced by other entities.`
		);
		this.name = 'CurrencyInUseError';
	}
}
