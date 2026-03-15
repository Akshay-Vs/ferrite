import { context, propagation } from '@opentelemetry/api';
import { Queue } from 'bullmq';
import { DEFAULT_JOB_OPTIONS } from './queue.constrains';

export abstract class BaseProducer<T> {
	protected abstract readonly queue: Queue;

	async enqueue(data: T, jobName: string): Promise<void> {
		const traceCarrier: Record<string, string> = {};
		propagation.inject(context.active(), traceCarrier);

		await this.queue.add(
			jobName,
			{ ...data, __traceContext: traceCarrier },
			DEFAULT_JOB_OPTIONS
		);
	}
}
