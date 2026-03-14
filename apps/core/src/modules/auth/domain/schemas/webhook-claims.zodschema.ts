import { z } from 'zod/v4';

export const eventTypeSchema = z.enum([
	'user.created',
	'user.updated',
	'user.deleted',
]);

export const rawWebhookClaimsSchema = z.object({
	eventId: z.string(),
	eventType: eventTypeSchema,
	timestamp: z.number(),
	data: z.record(z.string(), z.unknown()),
});

export type RawWebhookClaims = z.infer<typeof rawWebhookClaimsSchema>;
