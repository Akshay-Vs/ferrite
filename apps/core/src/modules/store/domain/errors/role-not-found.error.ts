export class RoleNotFoundError extends Error {
	readonly _tag = 'RoleNotFoundError';

	constructor(roleId: string, storeId: string) {
		super(`Role ${roleId} not found in store ${storeId}`);
	}
}
