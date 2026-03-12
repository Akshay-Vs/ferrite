import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtTokenUseCase } from './application/use-cases/jwt-token.usecase';
import { VerifyWebhookUseCase } from './application/use-cases/verify-webhook.usecase';
import { TOKEN_AUTH, WEBHOOK_AUTH } from './domain/ports/auth-provider.tokens';
import { AuthProviderFactory } from './infrastructure/adapters/auth-provider.factory';
import { ClerkAdapter } from './infrastructure/adapters/providers/clerk';
import { AuthGuard } from './infrastructure/http/guards/auth.guard';
import { WebhookGuard } from './infrastructure/http/guards/webhook.guard';

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

		JwtTokenUseCase,
		VerifyWebhookUseCase,

		AuthGuard,
		WebhookGuard,
	],

	// export guards
	exports: [AuthGuard, WebhookGuard],
})
export class AuthModule {}
