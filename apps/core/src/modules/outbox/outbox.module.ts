import { Module } from '@nestjs/common';
import { OUTBOX_REPOSITORY } from './domain/ports/outbox-repository.port';
import { DrizzleOutboxRepository } from './infrastructure/persistance/drizzle-outbox.repository';
import { OutboxWorker } from './infrastructure/replication/outbox.worker';

@Module({
	providers: [
		{
			provide: OUTBOX_REPOSITORY,
			useClass: DrizzleOutboxRepository,
		},
		OutboxWorker,
	],
	exports: [OUTBOX_REPOSITORY],
})
export class OutboxModule {}
