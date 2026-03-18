import { AuthUser } from '@auth/index';
import { ok, Result } from '@common/interfaces/result.interface';
import { OutboxEvent } from '@core/database/schema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '@users/domain/errors/user-not-found.error';
import type { IDeleteUserUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import { UserDeletedEvent } from '@users/domain/schemas';

@Injectable()
export class DeleteUserUseCase implements IDeleteUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(authUser: AuthUser): Promise<Result<void, UserNotFoundError>> {
		return this.tracer.withSpan('use-case.delete-user', async () => {
			const outboxEvent: OutboxEvent<UserDeletedEvent> = {
				aggregateId: authUser.id,
				aggregateType: 'user',
				eventType: 'user.profile_updated',
				payload: {
					eventType: 'user.deleted',
					externalAuthId: authUser.externalAuthId,
					provider: authUser.provider,
				},
			};

			const deleted = await this.repo.softDeleteById(
				authUser.id,
				authUser.provider,
				outboxEvent
			);

			if (!deleted) {
				this.logger.debug(`User already deleted or not found (no-op)`);
				return ok();
			}

			this.logger.log(`User soft-deleted`);
			return ok();
		});
	}
}
