import { isUniqueConstrainViolation } from '@common/errors/handlers/is-unique-constrain-violation';
import {
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';
import { inboxEvents } from '@core/database/schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { getTraceContext } from '@core/tracer/tracer.helpers';
import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';
import { ENQUEUE_GRAPHILE_EVENT_UC, type IEnqueue } from '@modules/queue';
import { Inject, Injectable } from '@nestjs/common';
import { IWebhookRepository } from '@webhooks/domain/ports/webhook-repository.port';

@Injectable()
export class WebhookRepository implements IWebhookRepository {
	constructor(
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(ENQUEUE_GRAPHILE_EVENT_UC) private readonly enqueue: IEnqueue,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async persistWebhook(envelope: WebhookEnvelope): Promise<boolean> {
		try {
			return await traceDbOp(
				this.tracer,
				'db.webhook.persist',
				{ 'db.table': 'webhooks', 'db.operation': 'insert' },
				async () => {
					const result = await this.uow.execute(async (ctx) => {
						const tx = DrizzleUnitOfWork.unwrap(ctx);
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

						const enqueueRes = await traceDbOp(
							this.tracer,
							'db.inbox_events.insert',
							{
								'db.table': 'graphile-worker',
								'db.operation': 'graphile-enqueue',
							},
							() =>
								this.enqueue.execute(ctx, {
									identifier: envelope.queueName,
									maxAttempts: 3,
									...envelope,
									__traceContext: getTraceContext(),
								})
						);

						if (enqueueRes.isErr()) {
							throw new Error('Failed to enqueue webhook event to graphile');
						}

						return inserted?.id ?? null;
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
