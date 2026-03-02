// src/db/db.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDrizzle, createSubscriber, DB, SUBSCRIBER } from './db.provider';

@Global()
@Module({
	providers: [
		{
			provide: DB,
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
				createDrizzle(config.getOrThrow<string>('DATABASE_URL')),
		},
		{
			provide: SUBSCRIBER,
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
				createSubscriber(config.getOrThrow<string>('DATABASE_URL')),
		},
	],
	exports: [DB, SUBSCRIBER],
})
export class DatabaseModule {}
