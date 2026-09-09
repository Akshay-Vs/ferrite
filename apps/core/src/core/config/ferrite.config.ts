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

/**
 * Nested env var overrides that map environment variables into sub-objects.
 * Format: [envKey, path] where path uses dot-notation (e.g. 'observability.instrumentation').
 */
const NESTED_ENV_MAPPINGS: [string, string][] = [
	['OBSERVABILITY_INSTRUMENTATION', 'observability.instrumentation'],
	['OBSERVABILITY_TRACER', 'observability.tracer'],
	['OBSERVABILITY_LOGGER_LOKI', 'observability.logger.loki'],
	['OBSERVABILITY_LOGGER_TTY', 'observability.logger.tty'],
];

export const ferriteConfig = registerAs('ferrite', () => {
	const explorer = cosmiconfigSync('ferrite-core', {
		searchPlaces: [
			'package.json',
			'.ferrite-corerc',
			'.ferrite-corerc.json',
			'.ferrite-corerc.yaml',
			'.ferrite-corerc.yml',
			'.ferrite-corerc.js',
			'.ferrite-corerc.ts',
			'ferrite-core.config.js',
			'ferrite-core.config.ts',
		],
		loaders: {
			'.ts': (filepath) => {
				// Bun supports native synchronous TS require
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const loaded = require(filepath);
				return loaded.default ?? loaded;
			},
		},
	});
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

	// Apply nested env var overrides (dot-notation paths → nested objects)
	for (const [envKey, path] of NESTED_ENV_MAPPINGS) {
		const value = process.env[envKey] ?? process.env[`FERRITE_${envKey}`];
		if (value === undefined) continue;

		const segments = path.split('.');
		let target = envOverrides as Record<string, unknown>;
		for (let i = 0; i < segments.length - 1; i++) {
			const seg = segments[i];
			if (target[seg] === undefined || typeof target[seg] !== 'object') {
				target[seg] = {};
			}
			target = target[seg] as Record<string, unknown>;
		}
		target[segments[segments.length - 1]] = value;
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
