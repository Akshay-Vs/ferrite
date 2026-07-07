import { z } from 'zod/v4';

export const loginSchema = z.object({
	email: z.email(),
	password: z.string(),
});

export type StorefrontUserLogin = z.infer<typeof loginSchema>;
