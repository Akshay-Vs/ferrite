export class UnknownInventoryError extends Error {
	readonly _tag = 'UnknownInventoryError';

	constructor(cause?: unknown) {
		super('An unknown error occurred in the inventory module', { cause });
	}
}
