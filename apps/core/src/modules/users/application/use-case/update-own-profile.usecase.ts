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
import type { UserProfileFull } from '@users/domain/schemas/user-profile.zodschema';
import { UserMapper } from '@users/infrastructure/persistance/mappers/user.mapper';

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
	}): Promise<Result<UserProfileFull, UserNotFoundError>> {
		return this.tracer.withSpan(
			'use-case.update-own-profile',
			async () => {
				const user = await this.repo.findById(input.authUser.id);

				if (!user) {
					this.logger.warn(`User row missing for id=${input.authUser.id}`);
					return err(new UserNotFoundError(input.authUser.id));
				}

				const userId = user.id;

				if (!userId) {
					this.logger.warn(
						`Internal user id not found for externalAuthId=${input.authUser.externalAuthId}`
					);
					return err(new UserNotFoundError(input.authUser.externalAuthId));
				}

				if (Object.keys(input.data).length === 0) {
					this.logger.debug('No fields to update, skipping write');
					const existingUser = await this.repo.findById(userId);
					if (!existingUser) return err(new UserNotFoundError(userId));
					return ok(UserMapper.toUserProfile(existingUser));
				}

				const outboxEvent = {
					aggregateId: userId,
					aggregateType: 'user',
					eventType: 'user.profile_updated',
					payload: { ...input.data },
				};

				const updatedProfile = await this.repo.updateProfileById(
					userId,
					input.data,
					outboxEvent
				);

				if (!updatedProfile) {
					this.logger.warn(`User update failed, not found: id=${userId}`);
					return err(new UserNotFoundError(userId));
				}

				this.logger.log(`Own profile updated: id=${userId}`);
				return ok(updatedProfile);
			},
			{ 'use-case.externalAuthId': input.authUser.externalAuthId }
		);
	}
}
