import { randomUUID } from 'node:crypto';
import type { AuthProvider } from '@auth/index';
import type { QueueParams } from '@modules/queue';
import type { UserUpdatedEvent } from '@users/domain/schemas/user-updated.zodschema';
import { USER_SYNC_QUEUE } from '@users/infrastructure/queue/queue.constraints';

/**
 * Builds the outbox event payload for a user profile update.
 *
 * This is the single source of truth for constructing the `QueueParams`
 * needed to sync profile changes to the external auth provider (Clerk).
 * Used by both `InitiateProfileUpdateUseCase` and the onboarding flow's
 * `UserDelegateAdapter`.
 *
 * @param data           The profile fields being updated.
 * @param externalAuthId The user's external auth provider ID.
 * @param provider       Auth provider name (e.g. 'clerk').
 */
export function buildUserUpdateOutboxEvent(
	data: Record<string, unknown>,
	externalAuthId: string,
	provider: AuthProvider
): QueueParams<UserUpdatedEvent> {
	const eventType = 'user.updated' as const;
	const eventId = randomUUID();

	return {
		identifier: USER_SYNC_QUEUE,
		queueName: USER_SYNC_QUEUE,
		maxAttempts: 5,
		eventType,
		eventId,
		payload: {
			...data,
			eventType,
			externalAuthId,
			provider,
		},
	};
}
