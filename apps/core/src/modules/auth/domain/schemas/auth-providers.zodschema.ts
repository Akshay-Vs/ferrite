import { z } from 'zod/v4';

export const authProvidersSchema = z.enum([
	'clerk',
	// 'kinde',
]);

export const authProvidersEnum = authProvidersSchema.enum;

export type AuthProvider = z.infer<typeof authProvidersSchema>;
