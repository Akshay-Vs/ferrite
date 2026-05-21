export class SystemRoleProtectedError extends Error {
	readonly _tag = 'SystemRoleProtectedError';

	constructor(roleId: string) {
		super(`Cannot modify system role ${roleId}`);
	}
}
