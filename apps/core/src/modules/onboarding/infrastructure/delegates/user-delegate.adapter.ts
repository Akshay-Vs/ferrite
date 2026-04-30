import type { AuthProvider } from '@auth/index';
import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { IUserDelegate } from '@modules/onboarding/domain/ports/user-delegate.port';
import type { SubmitAboutMeInput } from '@modules/onboarding/domain/schemas/submit-about-me.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import { buildUserUpdateOutboxEvent } from '@users/domain/utils/build-user-update-outbox-event.util';

/**
 * Infrastructure adapter bridging the Onboarding module's `IUserDelegate` port
 * to the Users module's existing `IUserRepository`.
 *
 * Uses the shared `buildUserUpdateOutboxEvent` utility so the outbox event
 * construction logic lives in exactly one place.
 */
@Injectable()
export class UserDelegateAdapter implements IUserDelegate {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository
	) {}

	async updateProfile(
		userId: string,
		data: SubmitAboutMeInput,
		externalAuthId: string,
		provider: string,
		tx?: ITransactionContext
	): Promise<void> {
		const outboxEvent = buildUserUpdateOutboxEvent(
			data,
			externalAuthId,
			provider as AuthProvider
		);

		const result = await this.userRepo.updateProfileById(
			userId,
			data,
			outboxEvent,
			tx
		);

		if (!result) {
			throw new Error(
				`Failed to update profile for user ${userId}: user not found`
			);
		}
	}

	async findById(
		userId: string
	): Promise<{ firstName: string | null; lastName: string | null } | null> {
		const user = await this.userRepo.findById(userId);
		if (!user) return null;

		return {
			firstName: user.firstName,
			lastName: user.lastName,
		};
	}
}
