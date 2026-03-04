/**
 * Shared test setup for database schema tests.
 *
 * Usage (in every *.spec.ts):
 *   import { db, setupTestDB, teardownTestDB, cleanupTables } from './setup';
 */

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PsqlDB } from '../db.type';
import * as schema from '../schema';

let client: ReturnType<typeof postgres>;
let _db: PsqlDB;

/** The Drizzle database instance used by all tests. */
export { _db as db };

/**
 * Strip query params like `?schema=public` that postgres.js doesn't support.
 */
function cleanConnectionUrl(raw: string): string {
	const url = new URL(raw);
	url.searchParams.delete('schema');
	return url.toString();
}

/**
 * Call once in `beforeAll`.
 * Creates the postgres client + drizzle instance.
 */
export async function setupTestDB(): Promise<PsqlDB> {
	const raw = process.env.DATABASE_URL;
	if (!raw) {
		throw new Error('DATABASE_URL is not set.');
	}

	client = postgres(cleanConnectionUrl(raw), {
		max: 1,
		debug: false,
		onnotice: () => {},
	});
	_db = drizzle(client, { schema });
	return _db;
}

/**
 * Truncate all tables involved in user & auth tests.
 * Call in `beforeEach` so every test starts with a clean slate.
 */
export async function cleanupTables(): Promise<void> {
	await _db.execute(sql`
		TRUNCATE TABLE
			user_auth_providers,
			user_payment_methods,
			user_notification_preferences,
			staff_permission_overrides,
			staff_members,
			role_permissions,
			permissions,
			roles,
			user_phones,
			user_addresses,
			users
		CASCADE
	`);
}

/**
 * Close the postgres connection. Call in `afterAll`.
 */
export async function teardownTestDB(): Promise<void> {
	await client.end();
}
