import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { Inject, Injectable } from '@nestjs/common';
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
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		input: UserCreatedEvent
	): Promise<Result<void, UserExistsError>> {
		const existing = await this.repo.findUserIdByExternalAuthId(
			input.externalAuthId,
			input.provider
		);

		if (existing) {
			this.logger.warn(
				`User already exists for externalAuthId=${input.externalAuthId}`
			);
			return err(new UserExistsError(input.externalAuthId));
		}

		const userId = await this.repo.createWithAuth(input);
		this.logger.log(
			`User created: id=${userId} externalAuthId=${input.externalAuthId}`
		);

		return ok();
	}
}
