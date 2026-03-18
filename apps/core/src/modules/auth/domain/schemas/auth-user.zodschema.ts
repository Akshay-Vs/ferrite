import { z } from 'zod/v4';
import { authProvidersSchema } from './auth-providers.zodschema';

export const authUserSchema = z.object({
	id: z.uuid(),
	externalAuthId: z.string(),
	provider: authProvidersSchema,
	email: z.string(),
	emailVerified: z.boolean(),
	fullName: z.string().optional(),
	role: z.string().optional(),
	metadata: z.record(z.union([z.string(), z.number()]), z.unknown()),
});

export type AuthUser = z.infer<typeof authUserSchema>;
