import { z } from 'zod/v4';
import { createCurrencySchema } from './create-currency.zodschema';

// Code is the PK and immutable — only symbol, precision, and active flag can change.
export const updateCurrencySchema = createCurrencySchema
	.omit({ code: true })
	.partial();

export const updateCurrencyInputSchema = z.object({
	code: z
		.string()
		.length(3, 'Currency code must be exactly 3 characters (ISO 4217)'),
	data: updateCurrencySchema,
});

export type UpdateCurrencyPayload = z.infer<typeof updateCurrencySchema>;
export type UpdateCurrencyInput = z.infer<typeof updateCurrencyInputSchema>;
