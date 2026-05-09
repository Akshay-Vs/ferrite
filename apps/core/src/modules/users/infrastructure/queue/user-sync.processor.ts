import { UnsupportedEventTypeError } from '@common/errors/unsupported-event-type.error';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { BaseProcessor } from '@core/processor';
import { GraphileProcessor } from '@core/processor/decorators/graphile-processor.decorator';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import {
	EventPayload,
	eventPayloadSchema,
} from '@ferrite/schema/common/event-payload.zodschema';
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
		@Inject(ROUTE_USER_EVENTS_UC)
		private readonly routeUserEvents: IRouteUserEventsUseCase,
		@Inject(OTEL_TRACER) private readonly otelTracer: ITracer
	) {
		super(logger);
	}

	protected async handle(
		payload: EventPayload,
		_helpers?: JobHelpers
	): Promise<Result<void, Error>> {
		return this.otelTracer.withSpan('UserSyncProcessor.handle', async () => {
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

				return err(result.error);
			}

			return ok();
		});
	}
}
