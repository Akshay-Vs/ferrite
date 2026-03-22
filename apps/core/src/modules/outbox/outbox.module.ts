import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { USER_SYNC_QUEUE } from '@users/infrastructure/queue/queue.constraints';
import {
	INSERT_OUTBOX_EVENT_UC,
	InsertOutboxEventUseCase,
} from './application/use-cases/insert-outbox-event.usecase';
import { OUTBOX_PRODUCER } from './domain/ports/outbox-producer.port';
import { OUTBOX_REPOSITORY } from './domain/ports/outbox-repository.port';
import { DrizzleOutboxRepository } from './infrastructure/persistance/drizzle-outbox.repository';
import { OutboxProducer } from './infrastructure/queue/outbox.producer';
import { OutboxCDCWorker } from './infrastructure/replication/outbox-cdc.worker';
import { OutboxReplicationSetupService } from './infrastructure/replication/outbox-replication-setup.service';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'default',
		}),
		BullModule.registerQueue({
			name: USER_SYNC_QUEUE,
		}),
	],
	providers: [
		// use case
		InsertOutboxEventUseCase,
		// port bindings
		{
			provide: OUTBOX_REPOSITORY,
			useClass: DrizzleOutboxRepository,
		},
		{
			provide: OUTBOX_PRODUCER,
			useClass: OutboxProducer,
		},
		{
			provide: INSERT_OUTBOX_EVENT_UC,
			useClass: InsertOutboxEventUseCase,
		},
		// infrastructure
		OutboxReplicationSetupService,
		OutboxCDCWorker,
	],
	exports: [
		InsertOutboxEventUseCase,
		OUTBOX_REPOSITORY,
		INSERT_OUTBOX_EVENT_UC,
	],
})
export class OutboxModule {}
