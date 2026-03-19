import { WebhookPayload } from '@auth/index';
import { webhookEnvelopeSchema } from '@common/schemas/webhook-envelope.zodschema';
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
import {
	type IWebhookMapperRegistry,
	WEBHOOK_MAPPER_REGISTRY,
} from '@users/domain/ports/webhook-mapper.registry.port';
import {
	UserSyncEvent,
	userSyncEventSchema,
} from '@users/domain/schemas/user-sync-event.zodschema';
import { Job } from 'bullmq';
import { USER_SYNC_QUEUE } from './queue.constraints';

@Processor(USER_SYNC_QUEUE)
export class UserSyncWorker extends BaseConsumer<WebhookPayload> {
	constructor(
		private readonly logger: AppLogger,
		@Inject(WEBHOOK_MAPPER_REGISTRY)
		private readonly registry: IWebhookMapperRegistry,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(ROUTE_USER_EVENTS_UC)
		private readonly routeUserEvents: IRouteUserEventsUseCase
	) {
		super();
		this.logger.setContext(this.constructor.name);
	}

	private transformEvent(job: Job<WebhookPayload>): UserSyncEvent {
		// Validate raw envelope
		const payload = webhookEnvelopeSchema.parse(job.data);

		// Map external payload to standard event candidate
		const mapper = this.registry.resolve(job.data.provider);
		const mapped = mapper.map(payload);

		if (!mapped) {
			throw new Error('Unknown event type');
		}

		// Re-validate and normalize mapper output
		const validatedEvent = userSyncEventSchema.parse(mapped);

		return validatedEvent;
	}

	private getTraceContext(job: Job<WebhookPayload>): Context {
		const carrier = job.data.__traceContext ?? {};
		return propagation.extract(context.active(), carrier);
	}

	async handle(job: Job<WebhookPayload>): Promise<void> {
		const traceContext = this.getTraceContext(job);
		await context.with(traceContext, async () => {
			return await this.tracer.withSpan(
				'user-sync-worker.handle',
				async () => {
					const userSyncEvent = this.transformEvent(job);
					this.logger.log(`Processing ${userSyncEvent.eventType}`);

					const result = await this.routeUserEvents.execute(userSyncEvent);

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
							`Failed to process ${userSyncEvent.eventType}: ${result.error.message}`
						);
						throw result.error;
					}
				},
				{
					'user-sync-worker.job.id': job.id ?? 'unknown',
					'user-sync-worker.event.type':
						(job.data as any)?.eventType ?? 'unknown',
				}
			);
		});
	}
}
