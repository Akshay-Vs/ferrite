import { z } from 'zod/v4';

export const webhookPayloadSchema = z.object({
	eventId: z.string(),
	eventType: z.string(),
	timestamp: z.number(),
	data: z.record(z.string(), z.unknown()),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
