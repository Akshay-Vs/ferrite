import { InfrastructureError } from '@common/errors/infrastructure.error';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { UserProfileFull } from '@ferrite/schema/users/user-profile.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '@users/domain/errors/user-not-found.error';
import type { IGetUserByIdUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';

@Injectable()
export class GetUserByIdUseCase implements IGetUserByIdUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		id: string
	): Promise<Result<UserProfileFull, UserNotFoundError | InfrastructureError>> {
		return this.tracer.withSpan(
			'use-case.get-user-by-id',
			async () => {
				try {
					const user = await this.repo.findById(id);

					if (!user) {
						this.logger.warn(`User not found: id=${id}`);
						return err(new UserNotFoundError(id));
					}

					return ok(user);
				} catch (e: any) {
					return err(new InfrastructureError('Failed to fetch user by id', e));
				}
			},
			{ 'user.id': id }
		);
	}
}
