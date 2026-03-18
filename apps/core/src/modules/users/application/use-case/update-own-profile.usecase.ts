import type { AuthUser } from '@auth/index';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '@users/domain/errors/user-not-found.error';
import type { IUpdateOwnProfileUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import type { UpdateProfileInput } from '@users/domain/schemas/update-profile.zodschema';

@Injectable()
export class UpdateOwnProfileUseCase implements IUpdateOwnProfileUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		authUser: AuthUser;
		data: UpdateProfileInput;
	}): Promise<Result<void, UserNotFoundError>> {
		return this.tracer.withSpan(
			'use-case.update-own-profile',
			async () => {
				const userId = await this.repo.findUserIdByExternalAuthId(
					input.authUser.externalAuthId,
					input.authUser.provider
				);

				if (!userId) {
					this.logger.warn(
						`Internal user id not found for externalAuthId=${input.authUser.externalAuthId}`
					);
					return err(new UserNotFoundError(input.authUser.externalAuthId));
				}

				if (Object.keys(input.data).length === 0) {
					this.logger.debug('No fields to update, skipping write');
					return ok();
				}

				const outboxEvent = {
					aggregateId: userId,
					aggregateType: 'user',
					eventType: 'user.profile_updated',
					payload: { ...input.data },
				};

				const updated = await this.repo.updateProfileById(
					userId,
					input.data,
					outboxEvent
				);

				if (!updated) {
					this.logger.warn(`User update failed, not found: id=${userId}`);
					return err(new UserNotFoundError(userId));
				}

				this.logger.log(`Own profile updated: id=${userId}`);
				return ok();
			},
			{ 'use-case.externalAuthId': input.authUser.externalAuthId }
		);
	}
}
