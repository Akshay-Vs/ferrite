import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DB = Symbol('DB');
export const DB_CLIENT = Symbol('DB_CLIENT');
export const SUBSCRIBER = Symbol('SUBSCRIBER');
export const SUBSCRIBER_CLIENT = Symbol('SUBSCRIBER_CLIENT');
export const DB_POOL = Symbol('DB_POOL');

export function createPool(databaseUrl: string) {
	return postgres(databaseUrl, {
		max: 10,
		idle_timeout: 20,
		max_lifetime: 1800,
		prepare: true,
	});
}

export function createSubscriber(databaseUrl: string) {
	return postgres(databaseUrl, {
		max: 10,
		fetch_types: false,
	});
}

export function createDrizzle(databaseUrl: string) {
	const client = createPool(databaseUrl);
	const db = drizzle(client, { schema });
	return { db, client };
}
