import { z } from 'zod/v4';

export const rawWebhookClaimsSchema = z.object({
	eventId: z.string(),
	eventType: z.string(),
	timestamp: z.number(),
	data: z.record(z.string(), z.unknown()),
});

export type RawWebhookClaims = z.infer<typeof rawWebhookClaimsSchema>;
