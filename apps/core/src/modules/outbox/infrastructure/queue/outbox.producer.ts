import type { ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer';
import { IOutboxProducer } from '@modules/outbox/domain/ports/outbox-producer.port';
import type { OutboxEvent } from '@modules/outbox/domain/schemas/outbox-event.zodschema';
import { getQueueToken } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bullmq';

@Injectable()
export class OutboxProducer implements IOutboxProducer {
	constructor(
		private readonly moduleRef: ModuleRef,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	async enqueue(event: OutboxEvent): Promise<void> {
		await this.tracer.withSpan(
			'outbox.producer.enqueue',
			async () => {
				const queue = this.getQueue(event.queueName);
				// The full event (including __traceContext) is serialised into the
				// BullMQ job data so the consumer can restore the origin trace.
				await queue.add(event.eventType, event, {
					jobId: event.eventId, // idempotency
				});
			},
			{
				'outbox.queue_name': event.queueName,
				'outbox.event_type': event.eventType,
				'outbox.event_id': event.eventId,
			}
		);
	}

	private getQueue(name: string): Queue {
		try {
			return this.moduleRef.get<Queue>(getQueueToken(name), { strict: false });
		} catch (error) {
			throw new Error(
				`Queue '${name}' is not registered. Please ensure it is registered via BullModule.registerQueue.`
			);
		}
	}
}
