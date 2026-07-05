import { randomUUID } from 'node:crypto';
import { InfrastructureError } from '@common/errors/infrastructure.error';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { UserUpdatedEvent } from '@ferrite/schema/users/index';
import type { UpdateRoleInput } from '@ferrite/schema/users/update-role.zodschema';
import type { UserProfileFull } from '@ferrite/schema/users/user-profile.zodschema';
import { MissingAuthProviderError } from '@modules/platform-users/domain/errors/missing-auth-provider.error';
import { UserNotFoundError } from '@modules/platform-users/domain/errors/user-not-found.error';
import type { IInitiateRoleUpdateUseCase } from '@modules/platform-users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@modules/platform-users/domain/ports/user-repository.port';
import { USER_SYNC_QUEUE } from '@modules/platform-users/infrastructure/queue/queue.constraints';
import type { QueueParams } from '@modules/queue';
import { Inject, Injectable } from '@nestjs/common';

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
	}): Promise<
		Result<
			UserProfileFull,
			MissingAuthProviderError | UserNotFoundError | InfrastructureError
		>
	> {
		return this.tracer.withSpan(
			'use-case.update-user-role',
			async () => {
				try {
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
						return err(new MissingAuthProviderError(user.id));
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
						this.logger.warn(
							`User role update failed, not found: id=${user.id}`
						);
						return err(new UserNotFoundError(user.id));
					}

					this.logger.log(
						`User role updated: id=${user.id} -> ${input.data.role}`
					);
					return ok(updatedProfile);
				} catch (e: any) {
					return err(new InfrastructureError('Failed to update user role', e));
				}
			},
			{ 'use-case.userId': input.userId }
		);
	}
}
