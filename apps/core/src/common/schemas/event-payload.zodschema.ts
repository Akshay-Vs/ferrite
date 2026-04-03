import { z } from 'zod';

export const eventPayloadSchema = z
	.object({
		eventId: z.string().min(1),
		eventType: z.string().min(1),
		aggregateType: z.string().min(1),
		payload: z.record(z.string(), z.unknown()),
		__traceContext: z.record(z.string(), z.string()).optional(),
	})
	.catchall(z.unknown());

export type EventPayload = z.infer<typeof eventPayloadSchema>;
