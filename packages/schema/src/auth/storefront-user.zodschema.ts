import { z } from 'zod/v4';

export const storefrontUserSchema = z.object({
	id: z.uuid(),
	storeId: z.uuid().describe('The ID of the store this user belongs to'),
	email: z.email(),
	emailVerified: z.boolean().default(false),
	displayName: z.string().optional(),
	role: z.enum(['customer', 'vip']).default('customer'),
	metadata: z.record(z.string(), z.unknown()).default({}),
});

export type StorefrontUser = z.infer<typeof storefrontUserSchema>;
