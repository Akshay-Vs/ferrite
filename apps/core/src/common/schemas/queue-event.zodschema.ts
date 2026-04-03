import { z } from 'zod';
import { eventPayloadSchema } from './event-payload.zodschema';

export const QueueParamsSchema = z
	.object({
		identifier: z.string(),
		maxAttempts: z.number(),
	})
	.extend(eventPayloadSchema.shape)
	.catchall(z.unknown());

export type QueueParams = z.infer<typeof QueueParamsSchema>;
