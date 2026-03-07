import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerifyTokenUsecase } from './application/use-cases/verify-token.usecase';
import {
	AUTH_ADAPTER,
	TOKEN_AUTH,
	WEBHOOK_AUTH,
} from './domain/ports/auth-provider.tokens';
import { AuthProviderFactory } from './infrastructure/adapters/auth-provider.factory';
import { ClerkAdapter } from './infrastructure/adapters/providers/clerk';
import { AuthGuard } from './infrastructure/http/guards/auth.guard';

const adapterFactory = (f: AuthProviderFactory) => f.getAdapter();

@Module({
	imports: [ConfigModule],
	providers: [
		ClerkAdapter,
		AuthProviderFactory,

		// PORT bindings
		{
			provide: AUTH_ADAPTER,
			useFactory: adapterFactory,
			inject: [AuthProviderFactory],
		},
		{
			provide: TOKEN_AUTH,
			useFactory: adapterFactory,
			inject: [AuthProviderFactory],
		},
		{
			provide: WEBHOOK_AUTH,
			useFactory: adapterFactory,
			inject: [AuthProviderFactory],
		},

		// use cases
		VerifyTokenUsecase,

		// guards
		AuthGuard,
	],
	exports: [VerifyTokenUsecase, AuthGuard],
})
export class AuthModule {}
