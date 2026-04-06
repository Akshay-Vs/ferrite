import { registerAs } from '@nestjs/config';
import { cosmiconfigSync } from 'cosmiconfig';
import { ferriteConfigSchema } from './ferrite.schema';

/**
 * Maps schema keys to legacy/specific environment variable names.
 * By default, the loader checks exact uppercase (e.g. PORT) and FERRITE_ uppercase (FERRITE_PORT).
 */
const ENV_MAPPINGS: Record<string, string> = {
	version: 'FERRITE_VERSION',
	origin: 'ORIGIN_URL',
};

export const ferriteConfig = registerAs('ferrite', () => {
	const explorer = cosmiconfigSync('ferrite-core');
	const result = explorer.search();

	const fileConfig = result?.config || {};
	const envOverrides: Record<string, unknown> = {};

	// Dynamically reconcile `process.env` properties against the schema shape keys automatically
	// Prioritizes environment variables over file-based configuration
	for (const key of Object.keys(ferriteConfigSchema.shape)) {
		const envKey = ENV_MAPPINGS[key] || key.toUpperCase();
		const fallbackFerriteKey = `FERRITE_${key.toUpperCase()}`;

		if (process.env[envKey] !== undefined) {
			envOverrides[key] = process.env[envKey];
		} else if (process.env[fallbackFerriteKey] !== undefined) {
			envOverrides[key] = process.env[fallbackFerriteKey];
		}
	}

	const mergedConfig = {
		...fileConfig,
		...envOverrides,
	};

	const parsed = ferriteConfigSchema.safeParse(mergedConfig);

	if (!parsed.success) {
		throw new Error(`Configuration validation error: ${parsed.error.message}`);
	}

	return parsed.data;
});
