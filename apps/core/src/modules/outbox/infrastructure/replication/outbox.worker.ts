import { SUBSCRIBER_CLIENT } from '@core/database/db.provider';
import type { Psql } from '@core/database/db.type';
import { AppLogger } from '@core/logger/logger.service';
import {
	Inject,
	Injectable,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import type { SubscriptionHandle } from 'postgres';
import {
	type IOutboxRepository,
	OUTBOX_REPOSITORY,
} from '../../domain/ports/outbox-repository.port';

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
	private subscription: SubscriptionHandle | null = null;

	constructor(
		@Inject(SUBSCRIBER_CLIENT) private readonly sql: Psql,
		@Inject(OUTBOX_REPOSITORY) private readonly outboxRepo: IOutboxRepository,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async onModuleInit() {
		this.logger.log('Starting WAL subscription for outbox_events...');

		try {
			// Listen to Logical Replication events (WAL) for inserts on outbox_events
			this.subscription = await this.sql.subscribe(
				'insert:outbox_events',
				this.handleOutboxEvent.bind(this),
				() =>
					this.logger.log(
						'WAL subscription for outbox_events connected and running.'
					),
				() => {
					this.logger.error('WAL subscription error occurred');
				}
			);
		} catch (error) {
			this.logger.error(
				'Failed to start WAL subscription',
				error instanceof Error ? error.stack : String(error)
			);
		}

		this.logger.log('Polling for pending outbox events...');
		try {
			const pending = await this.outboxRepo.findPending();
			if (pending.length > 0) {
				this.logger.log(
					`Found ${pending.length} pending events. Processing...`
				);
				for (const event of pending) {
					await this.handleOutboxEvent(event, null);
				}
			}
		} catch (error) {
			this.logger.error(
				'Failed to poll pending outbox events',
				error instanceof Error ? error.stack : String(error)
			);
		}
	}

	async onModuleDestroy() {
		if (this.subscription) {
			this.logger.log('Stopping WAL subscription for outbox_events...');
			this.subscription.unsubscribe();
		}
	}

	private async handleOutboxEvent(row: any, info: any) {
		this.logger.log(
			`Received outbox event: ${row.id} type=${JSON.stringify(row.payload, null, 2)}`
		);
		this.logger.log(`Received outbox info: ${JSON.stringify(info, null, 2)}`);
		// TODO: Trigger processing or relay to corresponding use-cases/queues
	}
}
