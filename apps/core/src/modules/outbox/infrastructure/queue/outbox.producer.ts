import { IOutboxProducer } from '@modules/outbox/domain/ports/outbox-producer.port';
import type { OutboxEvent } from '@modules/outbox/domain/schemas/outbox-event.zodschema';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class OutboxProducer implements IOutboxProducer {
	private readonly queues = new Map<string, Queue>();

	constructor(@InjectQueue('default') private readonly defaultQueue: Queue) {}

	async enqueue(event: OutboxEvent): Promise<void> {
		const queue = this.getQueue(event.queueName);
		await queue.add(event.eventType, event.payload, {
			jobId: event.id, // idempotency
		});
	}

	private getQueue(name: string): Queue {
		if (!this.queues.has(name)) {
			this.queues.set(
				name,
				new Queue(name, {
					connection: this.defaultQueue.opts.connection,
				})
			);
		}
		return this.queues.get(name)!;
	}
}
