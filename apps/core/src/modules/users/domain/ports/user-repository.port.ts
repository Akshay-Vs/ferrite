import { AuthProvider } from '@auth/index';
import type { DomainEvent } from '@modules/outbox/domain/schemas/domain-event';
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
		outboxEvent: DomainEvent<UserDeletedEvent>
	): Promise<boolean>;

	/**
	 * Find a user by their internal UUID.
	 * @returns The user profile, or null if not found (or soft-deleted).
	 */
	findById(id: string): Promise<UserProfileFull | null>;

	/**
	 * Update a user's profile and persist an outbox event in the same transaction.
	 * @returns The updated profile, or null if user not found.
	 */
	updateProfileById(
		id: string,
		data: UpdateProfileInput,
		outboxEvent: DomainEvent<UpdateProfileInput>
	): Promise<UserProfileFull | null>;
}
