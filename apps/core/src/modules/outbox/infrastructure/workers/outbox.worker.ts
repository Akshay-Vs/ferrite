import { SUBSCRIBER_CLIENT } from '@core/database/db.provider';
import type { Psql } from '@core/database/db.type';
import { AppLogger } from '@core/logger/logger.service';
import {
	Inject,
	Injectable,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { SubscriptionHandle } from 'postgres';
import {
	type IOutboxDispatcher,
	OUTBOX_DISPATCHER,
} from '../../domain/ports/outbox-dispatcher.port';
import {
	type IOutboxRepository,
	OUTBOX_REPOSITORY,
} from '../../domain/ports/outbox-repository.port';
import { OutboxEventMapper } from '../persistance/outbox-event.mapper';

@Injectable()
export class OutboxWorker implements OnModuleInit, OnModuleDestroy {
	private readonly BATCH_SIZE = 50;
	private readonly BATCH_DELAY_MS = 100;
	private readonly workerId = `worker-${randomUUID()}`;
	private subscription: SubscriptionHandle | null = null;

	constructor(
		@Inject(SUBSCRIBER_CLIENT) private readonly sql: Psql,
		@Inject(OUTBOX_REPOSITORY) private readonly outboxRepo: IOutboxRepository,
		@Inject(OUTBOX_DISPATCHER) private readonly dispatcher: IOutboxDispatcher,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	onModuleInit() {
		// Fire-and-forget: drain backlog then subscribe to live WAL.
		//? NOT awaited — NestJS must not block other modules from initialising.
		this.drainPendingEvents()
			.then(() => this.startWalSubscription())
			.catch((err) =>
				this.logger.error(
					'Outbox worker startup failed',
					err instanceof Error ? err.stack : String(err)
				)
			);
	}

	// Startup drain — cursor-paginated, rate-limited
	private async drainPendingEvents(): Promise<void> {
		this.logger.log('Draining pending outbox events...');
		let cursor: Date | undefined;
		let totalProcessed = 0;

		while (true) {
			const batch = await this.outboxRepo.claimPendingBatch(
				this.workerId,
				this.BATCH_SIZE,
				cursor
			);

			if (batch.length === 0) break;

			this.logger.log(
				`Processing batch of ${batch.length} (total so far: ${totalProcessed})`
			);

			// Process concurrently within the batch, but batches are sequential
			const results = await Promise.allSettled(
				batch.map((event) => this.handleOutboxEvent(event, null))
			);

			// Separate successes and failures
			const succeededIds: string[] = [];
			for (let i = 0; i < results.length; i++) {
				const result = results[i];
				const event = batch[i];
				if (result.status === 'fulfilled') {
					succeededIds.push(event.id);
				} else {
					const errMsg =
						result.reason instanceof Error
							? result.reason.message
							: String(result.reason);
					await this.outboxRepo.markFailed(event.id, errMsg);
				}
			}

			await this.outboxRepo.markProcessed(succeededIds);

			totalProcessed += batch.length;
			cursor = batch[batch.length - 1].createdAt; // advance cursor

			// Short pause — yields the event loop, avoids network burst
			if (batch.length === this.BATCH_SIZE) {
				await this.delay(this.BATCH_DELAY_MS);
			} else {
				break; // last page was partial → we're done
			}
		}

		this.logger.log(`Drain complete. Processed ${totalProcessed} events.`);
	}

	// Live WAL subscription (starts after drain)
	private async startWalSubscription(): Promise<void> {
		this.logger.log('Starting WAL subscription...');
		try {
			this.subscription = await this.sql.subscribe(
				'insert:outbox_events',
				this.handleOutboxEvent.bind(this),
				() => this.logger.log('WAL subscription connected.'),
				() => this.logger.error('WAL subscription error')
			);
		} catch (error) {
			this.logger.error(
				'Failed to start WAL subscription',
				error instanceof Error ? error.stack : String(error)
			);
		}
	}

	async onModuleDestroy() {
		this.subscription?.unsubscribe();
	}

	private async handleOutboxEvent(row: Record<string, unknown>, _info: any) {
		const event = OutboxEventMapper.toOutboxEvent(row);
		this.logger.debug(`Dispatching outbox event: ${event.eventType}`);
		await this.dispatcher.dispatch(event);
	}

	private delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
