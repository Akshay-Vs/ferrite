import z from 'zod/v4';

export const loginSchema = z.object({
	email: z.email('Please enter a valid email address.'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters.')
		.regex(/[^A-Za-z0-9]/, 'Must include at least one special character.'),
});
