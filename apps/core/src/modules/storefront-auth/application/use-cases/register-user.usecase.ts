import { err, ok, type Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { StorefrontUserResponse } from '@ferrite/schema/storefront-auth/storefront-user.zodschema';
import {
	type IStorefrontPasswordHasher,
	STOREFRONT_PASSWORD_HASHER,
} from '@modules/storefront-auth/domain/ports/password-hasher.port';
import { IStorefrontRegisterUser } from '@modules/storefront-auth/domain/ports/register-usecase.port';
import {
	type IStorefrontUserRepository,
	STOREFRONT_USER_REPOSITORY,
} from '@modules/storefront-auth/domain/ports/storefront-user-repository.port';
import { StorefrontUserMapper } from '@modules/storefront-auth/infrastructure/persistance/mappers/storefront-user.mapper';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RegisterUserUseCase implements IStorefrontRegisterUser {
	constructor(
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(STOREFRONT_USER_REPOSITORY)
		private readonly repo: IStorefrontUserRepository,
		@Inject(STOREFRONT_PASSWORD_HASHER)
		private readonly hasher: IStorefrontPasswordHasher
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		storeId: string;
		fullName: string;
		email: string;
		password: string;
		termsAndConditions: boolean;
	}): Promise<Result<StorefrontUserResponse, Error>> {
		return this.tracer.withSpan('use-case.register-user', async () => {
			try {
				const hashedPassword = await this.hasher.hash(input.password);

				const res = await this.repo.create({
					id: crypto.randomUUID(),
					storeId: input.storeId,
					email: input.email,
					displayName: input.fullName,
					passwordHash: hashedPassword,
				});

				return ok(StorefrontUserMapper.formatResponse(res));
			} catch (error: any) {
				//Todo: Add proper error handling and logging for different error scenarios (e.g., duplicate email, validation errors, etc.)
				this.logger.error('Failed to register user', error);
				return err(new Error('Registration failed'));
			}
		});
	}
}
