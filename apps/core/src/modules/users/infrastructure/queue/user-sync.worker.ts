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
import { type Context, context, propagation } from '@opentelemetry/api';
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

	private getTraceContext(job: Job<any>): Context {
		const carrier = job.data.__traceContext ?? {};
		return propagation.extract(context.active(), carrier);
	}

	async handle(job: Job<EventPayload>): Promise<void> {
		const traceContext = this.getTraceContext(job);
		await context.with(traceContext, async () => {
			return await this.tracer.withSpan(
				'user-sync-worker.handle',
				async () => {
					this.logger.debug(`Processing ${JSON.stringify(job.data, null, 2)}`);
					const validatedEvent = eventPayloadSchema.safeParse(job.data);

					if (validatedEvent.error) {
						this.logger.error(
							`Failed to validate event: ${validatedEvent.error.message}`
						);
						throw validatedEvent.error;
					}

					const { eventType } = validatedEvent.data;

					this.logger.debug(`Proceeding to route ${eventType}`);

					const result = await this.routeUserEvents.execute(job.data);

					// Handle result
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
				{
					'user-sync-worker.job.id': job.id ?? 'unknown',
					'user-sync-worker.event.type':
						(job.data as any)?.eventType ??
						(job.data as any)?.type ??
						'unknown',
				}
			);
		});
	}
}
