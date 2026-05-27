import { randomUUID } from 'node:crypto';
import { err, ok, Result } from '@common/interfaces/result.interface';
import {
	ITransactionContext,
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { type EmailTransitPayload } from '@ferrite/schema/notification/email.zodschema';
import {
	ENQUEUE_GRAPHILE_EVENT_UC,
	type IEnqueue,
	type QueueParams,
} from '@modules/queue';
import { Inject, Injectable } from '@nestjs/common';
import { type IEnqueueSendEmail } from '../../domain/ports/enqueue-email-producer.port';
import { SEND_EMAIL_QUEUE } from '../../infrastructure/queue/queue.constraints';

@Injectable()
export class EnqueueSendEmailUseCase implements IEnqueueSendEmail {
	constructor(
		@Inject(ENQUEUE_GRAPHILE_EVENT_UC) private readonly enqueue: IEnqueue,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		tx: ITransactionContext | undefined,
		payload: EmailTransitPayload
	): Promise<Result<void, Error>> {
		return this.tracer.withSpan('use-case.enqueue-send-email', async () => {
			try {
				const eventId = randomUUID();
				const outboxEvent: QueueParams<Record<string, unknown>> = {
					payload: payload as unknown as Record<string, unknown>,
					eventId,
					eventType: 'notification.send_email',
					queueName: SEND_EMAIL_QUEUE,
					identifier: SEND_EMAIL_QUEUE,
					maxAttempts: 5,
				};

				const performEnqueue = async (txn: ITransactionContext) => {
					return await this.enqueue.execute(txn, outboxEvent);
				};

				const result = tx
					? await performEnqueue(tx)
					: await this.uow.execute(performEnqueue);

				if (result.isErr()) {
					return err(result.error);
				}

				this.logger.debug(`Enqueued email eventId=${eventId}`);
				return ok();
			} catch (error: any) {
				this.logger.error(
} catch (caught: unknown) {
    const normalized =
        caught instanceof Error ? caught : new Error(String(caught));
    this.logger.error(
        `Failed to enqueue email: ${normalized.message}`,
        normalized.stack
    );
    return err(normalized);
}
			}
		});
	}
}
