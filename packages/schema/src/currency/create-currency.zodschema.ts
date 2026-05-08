import { z } from 'zod/v4';

export const createCurrencySchema = z.object({
	code: z
		.string()
		.length(3, 'Currency code must be exactly 3 characters (ISO 4217)')
		.regex(/^[A-Z]{3}$/, 'Currency code must be 3 uppercase letters'),
	symbol: z.string().min(1).max(10),
	decimalPrecision: z.int().min(0).max(18),
	isActive: z.boolean().default(true),
});

export type CreateCurrencyInput = z.infer<typeof createCurrencySchema>;
