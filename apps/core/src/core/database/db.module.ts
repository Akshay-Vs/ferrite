// src/db/db.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createPool, DB, DB_CLIENT } from './db.provider';
import { DatabaseShutdownService } from './db.shutdown';
import * as schema from './schema';

@Global()
@Module({
	providers: [
		{
			provide: DB_CLIENT,
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
				createPool(config.getOrThrow<string>('DATABASE_URL')),
		},
		{
			provide: DB,
			inject: [DB_CLIENT],
			useFactory: (client: Pool) => drizzle(client, { schema }),
		},
		DatabaseShutdownService,
	],
	exports: [DB, DB_CLIENT],
})
export class DatabaseModule {}
