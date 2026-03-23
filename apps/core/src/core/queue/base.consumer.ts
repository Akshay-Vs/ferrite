import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

export abstract class BaseConsumer<T> extends WorkerHost {
	abstract handle(job: Job<T>): Promise<void>;

	async process(job: Job<T>): Promise<void> {
		await this.handle(job);
	}
}
