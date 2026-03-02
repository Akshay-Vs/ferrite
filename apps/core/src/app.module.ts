import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { HttpExceptionFilter } from './common/filters/http-error-filter';

@Module({
	imports: [
		CacheModule.register({
			ttl: 60000, // 60 sec
			isGlobal: true,
		}),

		// Throttler
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000, // 60 sec
					limit: 10,
				},
			],
		}),

		// Config
		ConfigModule.forRoot({
			isGlobal: true,
		}),
	],
	controllers: [],
	providers: [
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
