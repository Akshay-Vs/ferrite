import { z } from 'zod/v4';

/**
 * Zod schema for creating a new outbox event.
 * Used to validate outbox entries before persisting.
 */
export const newOutboxEventSchema = z.object({
	aggregateId: z.uuid(),
	aggregateType: z.string().min(1),
	eventType: z.string().min(1),
	queueName: z.string().min(1),
	payload: z.record(z.string(), z.unknown()),
	status: z.string().default('pending'),
	retryCount: z.number().int().nonnegative().default(0),
	maxRetries: z.number().int().nonnegative().default(5),
});

export type NewOutboxEventInput = z.infer<typeof newOutboxEventSchema>;
