import { z } from 'zod/v4';

export const registerSchema = z.object({
	fullName: z.string(),
	email: z.email(),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long' })
		.regex(/[a-z]/, {
			message: 'Password must contain at least one lowercase letter',
		})
		.regex(/[A-Z]/, {
			message: 'Password must contain at least one uppercase letter',
		})
		.regex(/[0-9]/, { message: 'Password must contain at least one number' })
		.regex(/[^a-zA-Z0-9]/, {
			message: 'Password must contain at least one special character/symbol',
		}),
	termsAndConditions: z.boolean().default(false),
});

export type StorefrontUserRegister = z.infer<typeof registerSchema>;
