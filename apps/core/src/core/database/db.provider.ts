import { drizzle } from 'drizzle-orm/node-postgres';
import { runMigrations } from 'graphile-worker';
import { Pool } from 'pg';
import * as schema from './schema';

export const DB = Symbol('DB');
export const DB_CLIENT = Symbol('DB_CLIENT');
export const POOL = Symbol('POOL');

export function createPool(databaseUrl: string) {
	// setup graphile-worker
	runMigrations({
		connectionString: databaseUrl,
	});

	return new Pool({
		connectionString: databaseUrl,
		max: 10,
		idleTimeoutMillis: 20_000,
		connectionTimeoutMillis: 5_000,
	});
}

export function createDrizzle(databaseUrl: string) {
	const client = createPool(databaseUrl);
	const db = drizzle(client, { schema });
	return { db, client };
}
