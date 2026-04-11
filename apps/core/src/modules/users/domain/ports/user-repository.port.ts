import { AuthProvider } from '@auth/index';
import { PlatformRole } from '@common/schemas/platform-roles.zodschema';
import type { QueueParams } from '@modules/queue';
import { UserDeletedEvent, UserUpdatedEvent } from '../schemas';
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
		outboxEvent: QueueParams<UserDeletedEvent>
	): Promise<boolean>;

	/**
	 * Find all active (non-deleted) users.
	 * @returns An array of user profiles.
	 */
	findAll(
		cursor?: string,
		limit?: number,
		filters?: Partial<UserProfileFull> | Record<string, unknown>
	): Promise<{ items: UserProfileFull[]; nextCursor?: string }>;

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
		outboxEvent: QueueParams<UserUpdatedEvent>
	): Promise<UserProfileFull | null>;

	/**
	 * Update a user's platform role and persist an outbox event in the same transaction.
	 * @returns The updated profile, or null if user not found.
	 */
	updateRoleById(
		id: string,
		role: PlatformRole,
		outboxEvent: QueueParams<UserUpdatedEvent>
	): Promise<UserProfileFull | null>;

	/**
	 * Find a user and their associated auth providers.
	 * Required for operations needing external sync details.
	 */
	findByIdWithProviders(id: string): Promise<{
		user: UserProfileFull;
		providers: { provider: AuthProvider; externalAuthId: string }[];
	} | null>;
}
