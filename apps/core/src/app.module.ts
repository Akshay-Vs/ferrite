import { CommonModules } from '@common/common.module';
import { HttpExceptionFilter } from '@common/filters/http-error-filter';
import { CoreModules } from '@core/core.module';
import { AuthModule } from '@modules/auth/auth.module';
import { HealthModule } from '@modules/health/health.module';
import { QueueModule } from '@modules/queue';
import { StoreModule } from '@modules/store';
import { UsersModule } from '@modules/users/users.module';
import { WebhooksModule } from '@modules/webhooks/webhooks.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		CacheModule.register({ ttl: 60000, isGlobal: true }),
		ThrottlerModule.forRoot({
			throttlers: [{ ttl: 60000, limit: 100 }],
		}),

		CoreModules,
		CommonModules,

		QueueModule,
		HealthModule,
		WebhooksModule,

		AuthModule,
		StoreModule,
		UsersModule,
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
