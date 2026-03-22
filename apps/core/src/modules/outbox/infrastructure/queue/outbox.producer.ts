import { IOutboxProducer } from '@modules/outbox/domain/ports/outbox-producer.port';
import type { OutboxEvent } from '@modules/outbox/domain/schemas/outbox-event.zodschema';
import { getQueueToken } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bullmq';

@Injectable()
export class OutboxProducer implements IOutboxProducer {
	constructor(private readonly moduleRef: ModuleRef) {}

	async enqueue(event: OutboxEvent): Promise<void> {
		const queue = this.getQueue(event.queueName);
		await queue.add(event.eventType, event, {
			jobId: event.eventId, // idempotency
		});
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
