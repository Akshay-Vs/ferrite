import { UnsupportedEventTypeError } from '@common/errors/unsupported-event-type.error';
import { err, ok, Result } from '@common/interfaces/result.interface';
import {
	EventPayload,
	eventPayloadSchema,
} from '@common/schemas/event-payload.zodschema';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { BaseProcessor } from '@core/worker';
import { GraphileProcessor } from '@core/worker/decorators/graphile-processor.decorator';
import { Inject } from '@nestjs/common';
import { UserConflictError } from '@users/domain/errors/user-conflict.error';
import { UserExistsError } from '@users/domain/errors/user-exists.error';
import {
	type IRouteUserEventsUseCase,
	ROUTE_USER_EVENTS_UC,
} from '@users/domain/ports/use-cases.port';
import type { JobHelpers } from 'graphile-worker';
import { USER_SYNC_QUEUE } from './queue.constraints';

@GraphileProcessor(USER_SYNC_QUEUE)
export class UserSyncProcessor extends BaseProcessor<EventPayload> {
	constructor(
		protected readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(ROUTE_USER_EVENTS_UC)
		private readonly routeUserEvents: IRouteUserEventsUseCase
	) {
		super(logger);
	}

	protected async handle(
		payload: EventPayload,
		helpers?: JobHelpers
	): Promise<Result<void, Error>> {
		// Link to the trace context from the producer
		return await this.tracer.withPropagatedSpan(
			'user-sync-worker.handle',
			payload.__traceContext,
			async () => {
				const validatedEvent = eventPayloadSchema.safeParse(payload);

				if (!validatedEvent.success) {
					this.logger.error(
						`Failed to validate event: ${validatedEvent.error.message}`
					);

					return err(validatedEvent.error);
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

						return ok(); // Acknowledge job without throwing
					}

					this.logger.error(
						`Failed to process ${eventType}: ${result.error.message}`
					);

					err(result.error);
				}

				return ok();
			},
			undefined, // defaults to CONSUMER
			{
				'user-sync-worker.job.id': payload.eventId,
				'user-sync-worker.event.type': payload.eventType,
			}
		);
	}
}
