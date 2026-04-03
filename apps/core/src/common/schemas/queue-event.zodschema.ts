import { z } from 'zod';

const PayloadSchema = z.object({
	__traceContext: z.record(z.string(), z.string()).optional(),
	data: z.record(z.string(), z.unknown()),
});

export const QueueParamsSchema = z.object({
	identifier: z.string(),
	payload: PayloadSchema,
	queueName: z.string(),
	maxAttempts: z.number(),
});

export type QueueParams = z.infer<typeof QueueParamsSchema>;
