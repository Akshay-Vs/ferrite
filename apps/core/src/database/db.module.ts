// src/db/db.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	createDrizzle,
	createSubscriber,
	DB,
	DB_CLIENT,
	DB_POOL,
	SUBSCRIBER,
	SUBSCRIBER_CLIENT,
} from './db.provider';
import { DatabaseShutdownService } from './db.shutdown';

@Global()
@Module({
	providers: [
		{
			provide: DB_POOL,
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
				createDrizzle(config.getOrThrow<string>('DATABASE_URL')),
		},
		{
			provide: DB,
			inject: [DB_POOL],
			useFactory: ({ db }: { db: any }) => db,
		},
		{
			provide: DB_CLIENT,
			inject: [DB_POOL],
			useFactory: ({ client }: { client: any }) => client,
		},
		{
			provide: SUBSCRIBER,
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
				createSubscriber(config.getOrThrow<string>('DATABASE_URL')),
		},
		{
			provide: SUBSCRIBER_CLIENT,
			useExisting: SUBSCRIBER,
		},
		DatabaseShutdownService,
	],
	exports: [DB, DB_CLIENT, SUBSCRIBER, SUBSCRIBER_CLIENT],
})
export class DatabaseModule {}
