import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CheckStorePermissionUseCase } from './application/use-cases/check-store-permission.usecase';
import { JwtTokenUseCase } from './application/use-cases/jwt-token.usecase';
import { VerifyWebhookUseCase } from './application/use-cases/verify-webhook.usecase';
import {
	AUTH_PROVIDER,
	TOKEN_AUTH,
	WEBHOOK_AUTH,
} from './domain/ports/auth-provider.tokens';
import { STORE_PERMISSION_CHECKER } from './domain/ports/store-permission-checker.port';
import { AuthProviderFactory } from './infrastructure/adapters/auth-provider.factory';
import { ClerkAdapter } from './infrastructure/adapters/providers/clerk.adapter';
import { AuthGuard } from './infrastructure/http/guards/auth.guard';
import { PlatformRBACGuard } from './infrastructure/http/guards/platform-rbac.guard';
import { WebhookGuard } from './infrastructure/http/guards/webhook.guard';
import { DrizzleStorePermissionRepository } from './infrastructure/persistance/repositories/drizzle-store-permission.repository';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		ClerkAdapter,
		// KindeAdapter,

		AuthProviderFactory,

		{
			provide: TOKEN_AUTH,
			useFactory: (f: AuthProviderFactory) => f.getAdapter(),
			inject: [AuthProviderFactory],
		},
		{
			provide: WEBHOOK_AUTH,
			useExisting: TOKEN_AUTH,
		},

		// Store permission checker (cached repository)
		{
			provide: STORE_PERMISSION_CHECKER,
			useClass: DrizzleStorePermissionRepository,
		},

		// Global guards
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: PlatformRBACGuard,
		},

		{
			provide: AUTH_PROVIDER,
			useFactory: (f: AuthProviderFactory) => f.getAdapter(),
			inject: [AuthProviderFactory],
		},

		JwtTokenUseCase,
		VerifyWebhookUseCase,
		CheckStorePermissionUseCase,

		AuthGuard,
		WebhookGuard,
	],

	// export guards
	exports: [
		AuthGuard,
		WebhookGuard,
		AUTH_PROVIDER,
		STORE_PERMISSION_CHECKER,

		//? Resolved from AuthModule
		JwtTokenUseCase,
		VerifyWebhookUseCase,
		CheckStorePermissionUseCase,
	],
})
export class AuthModule {}
