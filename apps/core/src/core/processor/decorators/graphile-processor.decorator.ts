import { SetMetadata } from '@nestjs/common';
import { PROCESSOR_HANDLERS } from '../processor.constraints';

/**
 * Decorator that marks a class as a Graphile Worker task processor.
 *
 * Classes annotated with this decorator are automatically discovered by the
 * GraphileDiscoveryService and registered as handlers for the specified queue.
 *
 * The provided `queueName` determines which jobs are routed to the processor.
 * When a job is dequeued, the processor's `handle` method is invoked.
 *
 * Constraints:
 * - Each `queueName` must be unique. Registering multiple processors with the same
 *   queue name will result in an error during discovery.
 * - The decorated class must extend `BaseProcessor`. Violations will result in
 *   an error during discovery.
 *
 * @param queueName - The name of the Graphile Worker queue to subscribe to.
 *
 * @throws Error if:
 * - Duplicate queue names are detected
 * - The decorated class does not extend `BaseProcessor`
 *
 * @example
 * ```ts
 * @GraphileProcessor('user-sync-queue')
 * export class UserSyncWorker extends BaseProcessor<EventPayload> {
 *   protected async handle(payload: EventPayload, helpers: JobHelpers): Promise<void> {
 *     // Implement job handling logic here
 *   }
 * }
 * ```
 */
export const GraphileProcessor = (queueName: string) =>
	SetMetadata(PROCESSOR_HANDLERS, queueName);
