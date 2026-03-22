import {
	EventPayload,
	eventPayloadSchema,
} from '@common/schemas/event-payload.zodschema';
import { AppLogger } from '@core/logger/logger.service';
import { BaseConsumer } from '@core/queue/base.consumer';
import { UnsupportedEventTypeError } from '@core/queue/queue.errors';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Processor } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { UserConflictError } from '@users/domain/errors/user-conflict.error';
import { UserExistsError } from '@users/domain/errors/user-exists.error';
import {
	type IRouteUserEventsUseCase,
	ROUTE_USER_EVENTS_UC,
} from '@users/domain/ports/use-cases.port';
import { Job } from 'bullmq';
import { USER_SYNC_QUEUE } from './queue.constraints';

@Processor(USER_SYNC_QUEUE)
export class UserSyncWorker extends BaseConsumer<EventPayload> {
	constructor(
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(ROUTE_USER_EVENTS_UC)
		private readonly routeUserEvents: IRouteUserEventsUseCase
	) {
		super();
		this.logger.setContext(this.constructor.name);
	}

	async handle(job: Job<EventPayload>): Promise<void> {
		// Link to the trace context from the producer
		await this.tracer.withLinkedSpan(
			'user-sync-worker.handle',
			job.data.__traceContext,
			async () => {
				const validatedEvent = eventPayloadSchema.safeParse(job.data);

				if (!validatedEvent.success) {
					this.logger.error(
						`Failed to validate event: ${validatedEvent.error.message}`
					);
					throw validatedEvent.error;
				}

				const { eventType } = validatedEvent.data;
				const result = await this.routeUserEvents.execute(validatedEvent.data);

				if (result.isErr()) {
					if (
						result.error instanceof UnsupportedEventTypeError ||
						result.error instanceof UserExistsError ||
						result.error instanceof UserConflictError
					) {
						this.logger.warn(
							`Acknowledging expected domain error: ${result.error.message}`
						);
						return; // Acknowledge job without throwing
					}

					this.logger.error(
						`Failed to process ${eventType}: ${result.error.message}`
					);
					throw result.error;
				}
			},
			undefined, // defaults to CONSUMER
			{
				'user-sync-worker.job.id': job.data.eventId,
				'user-sync-worker.event.type': job.data.eventType,
			}
		);
	}
}
