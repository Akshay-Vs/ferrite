import type { AuthUser } from '@auth/index';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { UserProfileFull } from '@ferrite/schema/users/user-profile.zodschema';
import { UserNotFoundError } from '@modules/platform-users/domain/errors/user-not-found.error';
import type { IGetOwnProfileUseCase } from '@modules/platform-users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@modules/platform-users/domain/ports/user-repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetOwnProfileUseCase implements IGetOwnProfileUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		authUser: AuthUser
	): Promise<Result<UserProfileFull, UserNotFoundError>> {
		return this.tracer.withSpan(
			'use-case.get-own-profile',
			async () => {
				const user = await this.repo.findById(authUser.id);

				if (!user) {
					this.logger.warn(`User row missing for id=${authUser.id}`);
					return err(new UserNotFoundError(authUser.id));
				}

				return ok(user);
			},
			{ 'use-case.externalAuthId': authUser.externalAuthId }
		);
	}
}
