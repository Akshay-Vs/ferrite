export class OwnerProtectedError extends Error {
	readonly _tag = 'OwnerProtectedError';

	constructor() {
		super('Cannot remove or suspend the store owner');
	}
}
