import { randomUUID } from 'node:crypto';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { QueueParams } from '@modules/queue';
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '@users/domain/errors/user-not-found.error';
import type { IInitiateRoleUpdateUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import { UserUpdatedEvent } from '@users/domain/schemas';
import type { UpdateRoleInput } from '@users/domain/schemas/update-role.zodschema';
import type { UserProfileFull } from '@users/domain/schemas/user-profile.zodschema';
import { USER_SYNC_QUEUE } from '@users/infrastructure/queue/queue.constraints';

@Injectable()
export class InitiateRoleUpdateUseCase implements IInitiateRoleUpdateUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		userId: string;
		data: UpdateRoleInput;
	}): Promise<Result<UserProfileFull, UserNotFoundError>> {
		return this.tracer.withSpan(
			'use-case.update-user-role',
			async () => {
				const result = await this.repo.findByIdWithProviders(input.userId);

				if (!result) {
					this.logger.warn(`User row missing for id=${input.userId}`);
					return err(new UserNotFoundError(input.userId));
				}

				const { user, providers } = result;

				// If role is unchanged, just return the user profile directly
				if (user.platformRole === input.data.role) {
					this.logger.debug(`Role unchanged for user id=${user.id}`);
					return ok(user);
				}

				// Take the first provider (assumes Single Auth Provider like Clerk)
				const targetProvider = providers[0];
				if (!targetProvider) {
					this.logger.warn(`User missing auth provider: id=${user.id}`);
					return err(new UserNotFoundError(user.id));
				}

				const eventType = 'user.updated';
				const eventId = randomUUID();

				// We reuse the user.updated queue sync pattern!
				// The SyncProfileUpdateUseCase reads publicMetadata.role and relays to Clerk.
				const outboxEvent: QueueParams<UserUpdatedEvent> = {
					identifier: USER_SYNC_QUEUE,
					queueName: USER_SYNC_QUEUE,
					maxAttempts: 5,
					eventType,
					eventId,
					payload: {
						publicMetadata: {
							role: input.data.role,
						},
						eventType,
						externalAuthId: targetProvider.externalAuthId,
						provider: targetProvider.provider,
					},
				};

				const updatedProfile = await this.repo.updateRoleById(
					user.id,
					input.data.role,
					outboxEvent
				);

				if (!updatedProfile) {
					this.logger.warn(`User role update failed, not found: id=${user.id}`);
					return err(new UserNotFoundError(user.id));
				}

				this.logger.log(
					`User role updated: id=${user.id} -> ${input.data.role}`
				);
				return ok(updatedProfile);
			},
			{ 'use-case.userId': input.userId }
		);
	}
}
