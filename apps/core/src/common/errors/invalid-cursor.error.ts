export class InvalidCursorError extends Error {
	readonly _tag = 'InvalidCursorError';

	constructor() {
		super('Invalid cursor format');
	}
}
