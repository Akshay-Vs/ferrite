import { z } from 'zod';

/**
 * Generic job envelope used by **graphile-worker** for every task in the queue.
 * It is the standard wrapper that graphile-worker stores in the
 * `graphile_worker.jobs` table and passes to every processor's `handle()`
 * method, regardless of which feature enqueued the job.
 *
 * ## How to use in a processor
 * The `payload` field carries the actual job-specific data and must be
 * validated against the appropriate domain schema inside `handle()`:
 *
 * ```ts
 * // Good — parse the inner payload against your feature schema
 * protected async handle(envelope: EventPayload): Promise<Result<void, Error>> {
 *   const parsed = MyFeaturePayloadSchema.safeParse(envelope.payload);
 *   if (!parsed.success) return err(new MyError('Invalid payload'));
 *   return this.myUseCase.execute(parsed.data);
 * }
 * ```
 */
export const eventPayloadSchema = z
	.object({
		eventId: z.string().min(1),
		eventType: z.string().min(1),
		queueName: z.string().min(1),
		payload: z.record(z.string(), z.unknown()),
		__traceContext: z.record(z.string(), z.string()).optional(),
	})
	.catchall(z.unknown());

export type EventPayload = z.infer<typeof eventPayloadSchema>;
