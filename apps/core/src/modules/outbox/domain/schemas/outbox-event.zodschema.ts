import { z } from 'zod/v4';

/**
 * Zod schema for creating a new outbox event.
 * Used to validate outbox entries before persisting.
 */

export const OutboxEventSchema = z.object({
	id: z.uuid(),
	aggregateId: z.uuid(),
	aggregateType: z.string(),
	eventType: z.string(),
	queueName: z.string(),
	payload: z.unknown(),
	retryCount: z.number().int(),
	maxRetries: z.number().int(),
	createdAt: z.date(),
});

export const CreateOutboxEventSchema = OutboxEventSchema.omit({
	id: true,
	retryCount: true,
	createdAt: true,
});

export type OutboxEvent<T = unknown> = Omit<
	z.infer<typeof OutboxEventSchema>,
	'payload'
> & {
	payload: T;
};

export type CreateOutboxEvent<T = unknown> = Omit<
	z.infer<typeof CreateOutboxEventSchema>,
	'payload'
> & {
	payload: T;
};
