export class PermissionNotProvidedError extends Error {
	readonly _tag = 'PermissionNotProvidedError';

	constructor() {
		super(
			'No permissions provided for permission check, at least one is required'
		);
	}
}
