import { AuthProvider } from '@auth/index';
import type { OutboxEvent } from '@core/database/schema/outbox.schema';
import type { User } from '@core/database/schema/user.schema';
import { UserDeletedEvent } from '../schemas';
import type { UpdateProfileInput } from '../schemas/update-profile.zodschema';
import { UserCreatedEvent } from '../schemas/user-created.zodschema';
import type { UserProfileFull } from '../schemas/user-profile.zodschema';

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
	 * Soft-delete a user by setting `deletedAt`.
	 * @returns `true` if a row was updated, `false` if not found.
	 */
	softDeleteById(
		id: string,
		provider: AuthProvider,
		outboxEvent: OutboxEvent<UserDeletedEvent>
	): Promise<boolean>;

	/**
	 * Find a user by their internal UUID.
	 * @returns The user object, or null if not found (or softly deleted).
	 */
	findById(id: string): Promise<User | null>;

	/**
	 * Update a user's profile and persist an outbox event in the same transaction.
	 * @returns `true` if a row was updated, `false` if not found.
	 */
	updateProfileById(
		id: string,
		data: UpdateProfileInput,
		outboxEvent: OutboxEvent<UpdateProfileInput>
	): Promise<UserProfileFull | null>;
}
