import { Module } from '@nestjs/common';
import { OUTBOX_REPOSITORY } from './domain/ports/outbox-repository.port';
import { DrizzleOutboxRepository } from './infrastructure/drizzle-outbox.repository';

@Module({
	providers: [
		{
			provide: OUTBOX_REPOSITORY,
			useClass: DrizzleOutboxRepository,
		},
	],
	exports: [OUTBOX_REPOSITORY],
})
export class OutboxModule {}
