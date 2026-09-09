import { storefrontAuth } from '@modules/storefront-auth/domain/schemas/storefront-auth.config.zodschema';
import { z } from 'zod';

const observabilityLoggerSchema = z.object({
	loki: z.coerce.boolean().default(true),
	tty: z.coerce.boolean().default(true),
});

const observabilitySchema = z.object({
	instrumentation: z.coerce.boolean().default(true),
	tracer: z.coerce.boolean().default(true),
	logger: observabilityLoggerSchema.default(() =>
		observabilityLoggerSchema.parse({})
	),
});

export const ferriteConfigSchema = z.object({
	version: z.enum(['v1']).default('v1'),
	port: z.coerce.number().int().positive().default(4000),
	origin: z.preprocess((val) => {
		if (typeof val === 'string') {
			return val.trim() ? val.trim().split(/\s+/) : [];
		}
		return val;
	}, z.array(z.string()).default([])),

	storefrontAuth,
	observability: observabilitySchema.default(() =>
		observabilitySchema.parse({})
	),
});

export type FerriteConfig = z.infer<typeof ferriteConfigSchema>;

export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;
