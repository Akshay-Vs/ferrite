import { CoreModule } from '@core/core.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-error-filter';
import { HealthModule } from './modules/health/health.module';
import { OutboxModule } from './modules/outbox/outbox.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CacheModule.register({ ttl: 60000, isGlobal: true }),
		ThrottlerModule.forRoot({
			throttlers: [{ ttl: 60000, limit: 100 }],
		}),
		AuthModule, // ← provides AuthGuard, WebhookGuard, use cases
		CoreModule,
		HealthModule,
		UsersModule,
		WebhooksModule,
		OutboxModule,
	],
	providers: [
		// Guards
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		// Pipes
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
		// Interceptors
		{
			provide: APP_INTERCEPTOR,
			useClass: ZodSerializerInterceptor,
		},
		// Filters
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
})
export class AppModule {}
