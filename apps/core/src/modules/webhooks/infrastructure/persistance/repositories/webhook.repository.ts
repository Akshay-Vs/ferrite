import { WebhookPayload } from '@auth/index';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { inboxEvents } from '@core/database/schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { graphileEnqueue } from '@libs/queue/graphile-enqueue';
import { Inject, Injectable } from '@nestjs/common';
import { context, propagation } from '@opentelemetry/api';
import { IWebhookRepository } from '@webhooks/domain/ports/webhook-repository.port';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase, // type erasure for decorator metadata
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	private get typedDb(): TDatabase {
		return this.db;
	}

	persistWebhook(payload: WebhookPayload): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.webhook.persist',
			{ 'db.table': 'webhooks', 'db.operation': 'insert' },
			async () => {
				const traceCarrier: Record<string, string> = {};
				propagation.inject(context.active(), traceCarrier);

				const [result] = await this.typedDb.transaction(async (tx) => {
					// Write event to inbox
					const [inserted] = await traceDbOp(
						this.tracer,
						'db.webhooks.insert',
						{ 'db.table': 'webhooks', 'db.operation': 'insert' },
						() =>
							tx
								.insert(inboxEvents)
								.values(payload)
								.returning({ id: inboxEvents.id })
					);

					// Enqueue outbox event
					await traceDbOp(
						this.tracer,
						'db.outbox_events.insert',
						{
							'db.table': 'graphile-worker',
							'db.operation': 'graphile-enqueue',
						},
						() =>
							graphileEnqueue(tx, {
								identifier: payload.aggregateType,
								payload: {
									data: payload.payload,
									__traceContext: payload.__traceContext,
								},
								queueName: payload.eventType,
								maxAttempts: 3,
							})
					);
					return inserted.id;
				});

				return result !== null;
			}
		);
	}
}
