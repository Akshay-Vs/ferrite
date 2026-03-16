import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type postgres from 'postgres';
import type * as schema from './schema';

export type TDatabase = PostgresJsDatabase<typeof schema>;
export type Psql = postgres.Sql;
