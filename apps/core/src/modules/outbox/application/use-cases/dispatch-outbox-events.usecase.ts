import { Injectable } from '@nestjs/common';
import { type IOutboxDispatcher } from '../../domain/ports/outbox-dispatcher.port';
import { type IOutboxRepository } from '../../domain/ports/outbox-repository.port';

@Injectable()
export class DispatchOutboxEventsUseCase {
	constructor(
		private readonly outboxRepo: IOutboxRepository,
		private readonly dispatcher: IOutboxDispatcher
	) {}

	async execute(batchSize: number = 50): Promise<void> {
		// 1. Claim pending events
		const events = await this.outboxRepo.claimPendingBatch(
			'worker-main',
			batchSize
		);

		if (events.length === 0) {
			return;
		}

		// 2. Dispatch all events
		await Promise.all(events.map((event) => this.dispatcher.dispatch(event)));

		// 3. Mark as processed
		await this.outboxRepo.markProcessed(events.map((e) => e.id));
	}
}
