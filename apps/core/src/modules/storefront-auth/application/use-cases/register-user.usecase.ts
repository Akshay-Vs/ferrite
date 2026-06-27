import { err, ok, type Result } from '@common/interfaces/result.interface';
import {
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { StorefrontUserResponse } from '@ferrite/schema/storefront-auth/storefront-user.zodschema';
import {
	type ISendVerificationEmail,
	STOREFRONT_SEND_VERIFICATION_EMAIL_UC,
} from '@modules/storefront-auth/domain/ports/email-verification-usecase.port';
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
import { IncompleteConfigurationError } from '@store/domain/errors/incomplete-configuration.error';
import { EmailAlreadyRegisteredError } from '../../domain/errors/email-already-registered.error';

@Injectable()
export class RegisterUserUseCase implements IStorefrontRegisterUser {
	constructor(
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(STOREFRONT_USER_REPOSITORY)
		private readonly repo: IStorefrontUserRepository,
		@Inject(STOREFRONT_PASSWORD_HASHER)
		private readonly hasher: IStorefrontPasswordHasher,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(STOREFRONT_SEND_VERIFICATION_EMAIL_UC)
		private readonly sendVerificationEmail: ISendVerificationEmail
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		storeId: string;
		fullName: string;
		email: string;
		password: string;
		termsAndConditions: boolean;
	}): Promise<
		Result<
			StorefrontUserResponse,
			EmailAlreadyRegisteredError | IncompleteConfigurationError | Error
		>
	> {
		return this.tracer.withSpan('use-case.register-user', async () => {
			try {
				const hashedPassword = await this.hasher.hash(input.password);

				const result = await this.uow.execute(async (tx) => {
					const user = await this.repo.create(
						{
							id: crypto.randomUUID(),
							storeId: input.storeId,
							email: input.email,
							displayName: input.fullName,
							passwordHash: hashedPassword,
						},
						tx
					);

					// Enqueue verification email inside the same transaction (outbox pattern)
					const emailResult = await this.sendVerificationEmail.execute({
						storeId: input.storeId,
						userId: user.id,
						email: user.email,
						tx,
					});

					if (emailResult.isErr()) {
						// Throwing inside uow.execute rolls back the whole transaction
						throw emailResult.error;
					}

					return user;
				});

				this.logger.debug(
					`User registered and verification email enqueued: userId=${result.id}`
				);

				return ok(StorefrontUserMapper.formatResponse(result));
			} catch (error: unknown) {
				const normalized =
					error instanceof Error ? error : new Error(String(error));
				this.logger.error('Failed to register user', normalized.message);
				if (
					normalized instanceof EmailAlreadyRegisteredError ||
					normalized instanceof IncompleteConfigurationError
				) {
					return err(normalized);
				}
				return err(new Error('Registration failed'));
			}
		});
	}
}
