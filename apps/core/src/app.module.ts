import { CoreModule } from '@core/core.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AuthGuard } from '@modules/auth/infrastructure/http/guards/auth.guard';
import { UsersModule } from '@modules/users/users.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-error-filter';
import { HealthModule } from './modules/health/health.module';

@Global()
@Module({
	imports: [
		// Config
		ConfigModule.forRoot({
			isGlobal: true,
		}),

		CacheModule.register({
			ttl: 60000, // 60 sec
			isGlobal: true,
		}),

		// Throttler
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000, // 60 sec
					limit: 100,
				},
			],
		}),

		// Monitoring
		PrometheusModule.register(),

		AuthModule,
		CoreModule,
		HealthModule,
		UsersModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_PIPE,
			useClass: ZodValidationPipe,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ZodSerializerInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
})
export class AppModule {}
