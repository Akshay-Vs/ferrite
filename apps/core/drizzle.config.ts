import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

export default defineConfig({
	schema: './src/core/database/schema/index.ts',
	out: './src/core/database/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: DATABASE_URL,
	},
});
