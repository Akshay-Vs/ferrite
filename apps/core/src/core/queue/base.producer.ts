import { Queue } from 'bullmq';
import { DEFAULT_JOB_OPTIONS } from './queue.constrains';

export abstract class BaseProducer<T> {
	protected abstract readonly queue: Queue;

	async enqueue(data: T, jobName: string): Promise<void> {
		await this.queue.add(jobName, data, DEFAULT_JOB_OPTIONS);
	}
}
