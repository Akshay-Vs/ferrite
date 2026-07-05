export class UserConflictError extends Error {
	constructor(identifier: string) {
		super(
			`User creation conflict (potentially soft-deleted or duplicate PK): ${identifier}`
		);
		this.name = 'UserConflictError';
	}
}
