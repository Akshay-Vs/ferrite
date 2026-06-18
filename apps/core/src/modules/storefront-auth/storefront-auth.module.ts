import { Module } from '@nestjs/common';
import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { STOREFRONT_PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { STOREFRONT_REGISTER_UC } from './domain/ports/register-usecase.port';
import { STOREFRONT_USER_REPOSITORY } from './domain/ports/storefront-user-repository.port';
import {
	Argon2OptionsProvider,
	Argon2Provider,
} from './infrastructure/crypto/argon2.provider';
import { Argon2PasswordHasher } from './infrastructure/crypto/password-hasher';
import { StorefrontAuthController } from './infrastructure/http/controllers/storefront-auth.controller';
import { DrizzleStorefrontUserRepository } from './infrastructure/persistance/repositories/drizzle-storefront-user.repository';

@Module({
	controllers: [StorefrontAuthController],
	providers: [
		Argon2Provider,
		Argon2OptionsProvider,
		{
			provide: STOREFRONT_USER_REPOSITORY,
			useClass: DrizzleStorefrontUserRepository,
		},
		{
			provide: STOREFRONT_PASSWORD_HASHER,
			useClass: Argon2PasswordHasher,
		},
		{
			provide: STOREFRONT_REGISTER_UC,
			useClass: RegisterUserUseCase,
		},
	],
})
export class StorefrontAuthModule {}
