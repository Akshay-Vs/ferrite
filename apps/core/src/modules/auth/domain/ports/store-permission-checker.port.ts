/**
 * Port for checking store-level permissions.
 *
 * Implementations are responsible for resolving the effective permission set
 * for a user within a specific store (membership → role → granted permissions).
 */

export const STORE_PERMISSION_CHECKER = Symbol('IStorePermissionChecker');

export interface IStorePermissionChecker {
	/**
	 * Returns the list of granted permission keys (e.g. `"products:create"`)
	 * for the given user in the given store.
	 *
	 * Returns `null` when the user is not a member of the store.
	 */
	getPermissions(userId: string, storeId: string): Promise<string[] | null>;
}
