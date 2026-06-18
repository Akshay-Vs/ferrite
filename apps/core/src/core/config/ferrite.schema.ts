import { storefrontAuth } from '@modules/storefront-auth';
import { z } from 'zod';

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
});

export type FerriteConfig = z.infer<typeof ferriteConfigSchema>;
