import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constrain';
import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '@users/domain/errors/user-not-found.error';
import type { IUpdateUserUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import { UserUpdatedEvent } from '@users/domain/schemas/user-updated.zodschema';

@Injectable()
export class UpdateUserUseCase implements IUpdateUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: UserUpdatedEvent
	): Promise<Result<void, UserNotFoundError>> {
		return this.tracer.withSpan(
			'use-case.update-user',
			async () => {
				const updated = await this.repo.updateByExternalAuthId(input);

				if (!updated) {
					this.logger.warn(
						`User not found for externalAuthId=${input.externalAuthId}`
					);
					return err(new UserNotFoundError(input.externalAuthId));
				}

				this.logger.log(`User updated: externalAuthId=${input.externalAuthId}`);
				return ok();
			},
			{ 'use-case.externalAuthId': input.externalAuthId }
		);
	}
}
