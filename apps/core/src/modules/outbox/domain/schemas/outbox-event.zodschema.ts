import { eventPayloadSchema } from '@common/schemas/event-payload.zodschema';
import { z } from 'zod/v4';

/**
 * Zod schema for creating a new outbox event.
 * Used to validate outbox entries before persisting.
 */

export const OutboxEventSchema = z
	.object({
		aggregateId: z.uuid(),
		aggregateType: z.string(),
		eventType: z.string(),
		queueName: z.string(),
		payload: z.unknown(),
		retryCount: z.number().int(),
		maxRetries: z.number().int(),
		createdAt: z.date(),
	})
	.extend(eventPayloadSchema.shape);

export const CreateOutboxEventSchema = OutboxEventSchema.omit({
	eventId: true,
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
