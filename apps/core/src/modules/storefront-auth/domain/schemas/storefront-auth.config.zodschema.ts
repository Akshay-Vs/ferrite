import { z } from 'zod/v4';

const argon2Schema = z.object({
	memoryCost: z.coerce.number().int().positive().default(19456),
	timeCost: z.coerce.number().int().positive().default(2),
	parallelism: z.coerce.number().int().positive().default(1),
	outputLen: z.coerce.number().int().positive().default(32),
	salt: z.string().optional(),
	saltLen: z.coerce.number().int().positive().default(16),
});

const redisSchema = z.object({
	db: z.coerce.number().int().nonnegative().default(0),
	tls: z.boolean().default(false),
});

const rateLimitConfigSchema = z.object({
	windowMs: z.coerce
		.number()
		.int()
		.positive()
		.default(15 * 60 * 1000),
	maxAttempts: z.coerce.number().int().positive().default(5),
});

const rateLimitingSchema = z.object({
	login: rateLimitConfigSchema.default(() => rateLimitConfigSchema.parse({})),
	loginIp: z
		.object({
			windowMs: z.coerce
				.number()
				.int()
				.positive()
				.default(15 * 60 * 1000),
			maxAttempts: z.coerce.number().int().positive().default(20),
		})
		.default(() =>
			z
				.object({
					windowMs: z.coerce
						.number()
						.int()
						.positive()
						.default(15 * 60 * 1000),
					maxAttempts: z.coerce.number().int().positive().default(20),
				})
				.parse({})
		),
	registerIp: z
		.object({
			windowMs: z.coerce
				.number()
				.int()
				.positive()
				.default(60 * 60 * 1000),
			maxAttempts: z.coerce.number().int().positive().default(10),
		})
		.default(() =>
			z
				.object({
					windowMs: z.coerce
						.number()
						.int()
						.positive()
						.default(60 * 60 * 1000),
					maxAttempts: z.coerce.number().int().positive().default(10),
				})
				.parse({})
		),
	passwordReset: z
		.object({
			windowMs: z.coerce
				.number()
				.int()
				.positive()
				.default(60 * 60 * 1000),
			maxAttempts: z.coerce.number().int().positive().default(3),
		})
		.default(() =>
			z
				.object({
					windowMs: z.coerce
						.number()
						.int()
						.positive()
						.default(60 * 60 * 1000),
					maxAttempts: z.coerce.number().int().positive().default(3),
				})
				.parse({})
		),
	verifyEmail: rateLimitConfigSchema.default(() =>
		rateLimitConfigSchema.parse({})
	),
	mfaVerify: rateLimitConfigSchema.default(() =>
		rateLimitConfigSchema.parse({})
	),
});

const storefrontAuthSchema = z.object({
	argon2: argon2Schema.default(() => argon2Schema.parse({})),
	redis: redisSchema.default(() => redisSchema.parse({})),
	rateLimiting: rateLimitingSchema.default(() => rateLimitingSchema.parse({})),
});

export const storefrontAuth = storefrontAuthSchema.default(() =>
	storefrontAuthSchema.parse({})
);
