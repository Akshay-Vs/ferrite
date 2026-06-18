import { z } from 'zod/v4';

const argon2Schema = z.object({
	memoryCost: z.coerce.number().int().positive().default(19456),
	timeCost: z.coerce.number().int().positive().default(2),
	parallelism: z.coerce.number().int().positive().default(1),
	outputLen: z.coerce.number().int().positive().default(32),
	salt: z.string().optional(),
	saltLen: z.coerce.number().int().positive().default(16),
});

const storefrontAuthSchema = z.object({
	argon2: argon2Schema.default(() => argon2Schema.parse({})),
});

export const storefrontAuth = storefrontAuthSchema.default(() =>
	storefrontAuthSchema.parse({})
);
