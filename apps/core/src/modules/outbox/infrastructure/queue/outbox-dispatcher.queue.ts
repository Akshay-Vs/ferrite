import type { OutboxEvent } from '@core/database/schema';
import { AppLogger } from '@core/logger/logger.service';
import { DEFAULT_JOB_OPTIONS } from '@core/queue/queue.constraints';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { context, propagation } from '@opentelemetry/api';
import { Queue } from 'bullmq';
import type { IOutboxDispatcher } from '../../domain/ports/outbox-dispatcher.port';

/**
 * BullMQ adapter that dynamically routes outbox events to the queue
 * specified by each event's `queueName` field.
 *
 * Queue instances are lazily created and cached for the lifetime of the
 * process to avoid reconnecting on every dispatch.
 */
@Injectable()
export class OutboxDispatcherQueue
	implements IOutboxDispatcher, OnModuleDestroy
{
	private readonly queues = new Map<string, Queue>();

	constructor(
		private readonly config: ConfigService,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async dispatch(event: OutboxEvent): Promise<void> {
		const queue = this.getOrCreateQueue(event.queueName);

		const traceCarrier: Record<string, string> = {};
		propagation.inject(context.active(), traceCarrier);

		await queue.add(
			event.eventType,
			{ ...event, __traceContext: traceCarrier },
			DEFAULT_JOB_OPTIONS
		);
	}

	async onModuleDestroy() {
		await Promise.all([...this.queues.values()].map((q) => q.close()));
		this.queues.clear();
	}

	private getOrCreateQueue(name: string): Queue {
		let queue = this.queues.get(name);
		if (queue) return queue;

		this.logger.log(`Creating BullMQ queue: ${name}`);
		queue = new Queue(name, {
			connection: {
				host: this.config.getOrThrow<string>('REDIS_HOST'),
				port: Number(this.config.getOrThrow<string>('REDIS_PORT')),
				password: this.config.getOrThrow<string>('REDIS_PASSWORD'),
			},
		});

		this.queues.set(name, queue);
		return queue;
	}
}
