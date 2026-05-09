import { z } from 'zod/v4';
import { createCurrencySchema } from './create-currency.zodschema';

export const getCurrencieschema = createCurrencySchema
	.pick({ code: true })
	.extend({
		activeOnly: z.boolean().default(true),
	})
	.partial();

export type GetCurrenciesInput = z.infer<typeof getCurrencieschema>;
