import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtTokenUseCase } from './application/use-cases/jwt-token.usecase';
import { VerifyWebhookUseCase } from './application/use-cases/verify-webhook.usecase';
import {
	AUTH_PROVIDER,
	TOKEN_AUTH,
	WEBHOOK_AUTH,
} from './domain/ports/auth-provider.tokens';
import { AuthProviderFactory } from './infrastructure/adapters/auth-provider.factory';
import { ClerkAdapter } from './infrastructure/adapters/providers/clerk';
import { AuthGuard } from './infrastructure/http/guards/auth.guard';
import { WebhookGuard } from './infrastructure/http/guards/webhook.guard';

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
		{
			provide: APP_GUARD,
			useClass: AuthGuard, // ← resolved from AuthModule
		},

		{
			provide: AUTH_PROVIDER,
			useFactory: (f: AuthProviderFactory) => f.getAdapter(),
			inject: [AuthProviderFactory],
		},

		JwtTokenUseCase,
		VerifyWebhookUseCase,

		AuthGuard,
		WebhookGuard,
	],

	// export guards
	exports: [
		AuthGuard,
		WebhookGuard,
		AUTH_PROVIDER,

		//? Resolved from AuthModule
		JwtTokenUseCase,
		VerifyWebhookUseCase,
	],
})
export class AuthModule {}
