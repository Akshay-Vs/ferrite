import { Module } from '@nestjs/common';
import { OUTBOX_DISPATCHER } from './domain/ports/outbox-dispatcher.port';
import { OUTBOX_REPOSITORY } from './domain/ports/outbox-repository.port';
import { DrizzleOutboxRepository } from './infrastructure/persistance/drizzle-outbox.repository';
import { OutboxDispatcherQueue } from './infrastructure/queue/outbox-dispatcher.queue';
import { OutboxWorker } from './infrastructure/workers/outbox.worker';

@Module({
	providers: [
		{
			provide: OUTBOX_REPOSITORY,
			useClass: DrizzleOutboxRepository,
		},
		{
			provide: OUTBOX_DISPATCHER,
			useClass: OutboxDispatcherQueue,
		},
		OutboxWorker,
	],
	exports: [OUTBOX_REPOSITORY],
})
export class OutboxModule {}
