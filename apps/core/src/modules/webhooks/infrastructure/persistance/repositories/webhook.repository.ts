import { isUniqueConstrainViolation } from '@common/errors/handlers/is-unique-constrain-violation';
import { WebhookEnvelope } from '@common/schemas/webhook-envelope.zodschema';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { inboxEvents } from '@core/database/schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { getTraceContext } from '@core/tracer/tracer.helpers';
import { graphileEnqueue } from '@libs/queue/graphile-enqueue';
import { Inject, Injectable } from '@nestjs/common';
import { IWebhookRepository } from '@webhooks/domain/ports/webhook-repository.port';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	private get typedDb(): TDatabase {
		return this.db;
	}

	async persistWebhook(envelope: WebhookEnvelope): Promise<boolean> {
		try {
			return await traceDbOp(
				this.tracer,
				'db.webhook.persist',
				{ 'db.table': 'webhooks', 'db.operation': 'insert' },
				async () => {
					const [result] = await this.typedDb.transaction(async (tx) => {
						const [inserted] = await traceDbOp(
							this.tracer,
							'db.webhooks.insert',
							{ 'db.table': 'webhooks', 'db.operation': 'insert' },
							() =>
								tx
									.insert(inboxEvents)
									.values(envelope)
									.returning({ id: inboxEvents.id })
						);

						await traceDbOp(
							this.tracer,
							'db.outbox_events.insert',
							{
								'db.table': 'graphile-worker',
								'db.operation': 'graphile-enqueue',
							},
							() =>
								graphileEnqueue(tx, {
									identifier: envelope.queueName,
									payload: {
										data: envelope.payload,
										__traceContext: getTraceContext(),
									},
									queueName: envelope.eventType,
									maxAttempts: 3,
								})
						);

						return inserted.id;
					});

					this.logger.debug(
						`Written webhook event to inbox: ${envelope.eventId}`
					);
					return result !== null;
				}
			);
		} catch (err: unknown) {
			if (isUniqueConstrainViolation(err)) {
				this.logger.debug(
					`Acknowledged duplicate webhook event: ${envelope.eventId}`
				);
				return true;
			}
			throw err;
		}
	}
}
