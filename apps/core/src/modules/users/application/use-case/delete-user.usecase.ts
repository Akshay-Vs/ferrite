import type { AuthUser } from '@auth/index';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { DomainEvent } from '@modules/outbox/domain/schemas/domain-event';
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '@users/domain/errors/user-not-found.error';
import type { IDeleteUserUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import type { UserDeletedEvent } from '@users/domain/schemas/user-deleted.zodschema';
import { USER_SYNC_QUEUE } from '@users/infrastructure/queue/queue.constraints';

@Injectable()
export class DeleteUserUseCase implements IDeleteUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		authUser: AuthUser
	): Promise<Result<boolean, UserNotFoundError>> {
		return this.tracer.withSpan(
			'use-case.delete-user',
			async () => {
				const user = await this.repo.findById(authUser.id);

				if (!user) {
					return err(new UserNotFoundError(authUser.id));
				}

				const outboxEvent: DomainEvent<UserDeletedEvent> = {
					aggregateId: user.id,
					aggregateType: 'user',
					eventType: 'user.deleted',
					queueName: USER_SYNC_QUEUE,
					payload: {
						eventType: 'user.deleted',
						externalAuthId: authUser.externalAuthId,
						provider: authUser.provider,
					},
				};

				const deleted = await this.repo.softDeleteById(
					user.id,
					authUser.provider,
					outboxEvent
				);

				if (!deleted) {
					return err(new UserNotFoundError(user.id));
				}

				this.logger.log(
					`User soft-deleted: id=${user.id}, provider=${authUser.provider}`
				);
				return ok(true);
			},
			{ 'use-case.externalAuthId': authUser.externalAuthId }
		);
	}
}
