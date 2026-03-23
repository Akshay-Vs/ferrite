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
		await this.enqueueBatch([event]);
	}

	async enqueueBatch(events: OutboxEvent[]): Promise<void> {
		if (events.length === 0) return;

		const byQueue = this.groupByQueue(events); // ← replace Map.groupBy

		await this.tracer.withSpan(
			'outbox.producer.enqueueBatch',
			async () => {
				await Promise.all(
					[...byQueue.entries()].map(([queueName, queueEvents]) =>
						this.enqueueBatchForQueue(queueName, queueEvents)
					)
				);
			},
			{
				'outbox.batch_size': events.length,
				'outbox.queue_count': byQueue.size,
			}
		);
	}
	private groupByQueue(events: OutboxEvent[]): Map<string, OutboxEvent[]> {
		return events.reduce((map, event) => {
			const group = map.get(event.queueName) ?? [];
			group.push(event);
			map.set(event.queueName, group);
			return map;
		}, new Map<string, OutboxEvent[]>());
	}

	private async enqueueBatchForQueue(
		queueName: string,
		events: OutboxEvent[]
	): Promise<void> {
		const queue = this.getQueue(queueName);

		const jobs = events.map((event) => ({
			name: event.eventType,
			data: event,
			opts: {
				jobId: event.eventId, // idempotency
			},
		}));

		await queue.addBulk(jobs);
	}

	private getQueue(name: string): Queue {
		try {
			return this.moduleRef.get<Queue>(getQueueToken(name), { strict: false });
		} catch {
			throw new Error(
				`Queue '${name}' is not registered. Please ensure it is registered via BullModule.registerQueue.`
			);
		}
	}
}
