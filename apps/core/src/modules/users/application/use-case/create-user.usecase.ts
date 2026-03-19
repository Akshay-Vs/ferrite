import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { UserConflictError } from '@users/domain/errors/user-conflict.error';
import { UserExistsError } from '@users/domain/errors/user-exists.error';
import type { ICreateUserUseCase } from '@users/domain/ports/use-cases.port';
import {
	type IUserRepository,
	USER_REPOSITORY,
} from '@users/domain/ports/user-repository.port';
import { UserCreatedEvent } from '@users/domain/schemas/user-created.zodschema';

@Injectable()
export class CreateUserUseCase implements ICreateUserUseCase {
	constructor(
		@Inject(USER_REPOSITORY) private readonly repo: IUserRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: UserCreatedEvent
	): Promise<Result<void, UserExistsError | UserConflictError>> {
		return this.tracer.withSpan(
			'use-case.create-user',
			async () => {
				const existing = await this.repo.findById(input.id);

				if (existing) {
					this.logger.warn(
						`User already exists for externalAuthId=${input.externalAuthId}`
					);
					return err(new UserExistsError(input.externalAuthId));
				}

				try {
					await this.repo.createWithAuth(input);
					this.logger.debug(
						`User created: id=${input.id} externalAuthId=${input.externalAuthId}`
					);
					return ok();
				} catch (error: any) {
					// 23505 is the Postgres error code for unique_violation
					if (error?.code === '23505' || error?.cause?.code === '23505') {
						this.logger.warn(
							`User creation conflict (potentially soft-deleted PK): id=${input.id} externalAuthId=${input.externalAuthId}`
						);
						return err(new UserConflictError(input.externalAuthId));
					}

					this.logger.error(
						`Failed to create user: id=${input.id} externalAuthId=${input.externalAuthId}`,
						error //? error.stack : String(error)
					);
					throw error;
				}
			},
			{ 'use-case.externalAuthId': input.externalAuthId }
		);
	}
}
