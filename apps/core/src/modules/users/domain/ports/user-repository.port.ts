import { AuthProvider } from '@auth/index';
import { UserCreatedEvent } from '../schemas/user-created.zodschema';
import { UserUpdatedEvent } from '../schemas/user-updated.zodschema';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * User persistence port.
 *
 * Provides the contract for user CRUD operations. Implementations
 * are responsible for transactional integrity and provider-aware lookups.
 */
export interface IUserRepository {
	/**
	 * Create a user and link an auth provider in a single transaction.
	 * @returns The generated user id.
	 */
	createWithAuth(event: UserCreatedEvent): Promise<string>;

	/**
	 * Update user fields by their external auth provider id.
	 * @returns `true` if a row was updated, `false` if not found.
	 */
	updateByExternalAuthId(event: UserUpdatedEvent): Promise<boolean>;

	/**
	 * Soft-delete a user by setting `deletedAt`.
	 * @returns `true` if a row was updated, `false` if not found.
	 */
	softDeleteByExternalAuthId(
		externalAuthId: string,
		provider: AuthProvider
	): Promise<boolean>;

	/**
	 * Find a user id by their external auth provider id.
	 */
	findUserIdByExternalAuthId(
		externalAuthId: string,
		provider: AuthProvider
	): Promise<string | null>;
}
