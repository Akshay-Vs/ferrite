import { z } from 'zod';

export const eventPayloadSchema = z
	.object({
		eventId: z.string().min(1),
		eventType: z.string().min(1),
		payload: z.record(z.string(), z.unknown()),
	})
	.catchall(z.unknown());

export type EventPayload = z.infer<typeof eventPayloadSchema>;
