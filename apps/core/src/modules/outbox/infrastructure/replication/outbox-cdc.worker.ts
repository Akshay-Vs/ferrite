import {
	type IOutboxProducer,
	OUTBOX_PRODUCER,
} from '@modules/outbox/domain/ports/outbox-producer.port';
import type { OutboxEvent } from '@modules/outbox/domain/schemas/outbox-event.zodschema';
import {
	Inject,
	Injectable,
	Logger,
	OnApplicationBootstrap,
	OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	LogicalReplicationService,
	PgoutputPlugin,
} from 'pg-logical-replication';
import { OutboxEventMapper } from '../persistance/mappers/outbox-event.mapper';

@Injectable()
export class OutboxCDCWorker
	implements OnApplicationBootstrap, OnApplicationShutdown
{
	private readonly logger = new Logger(OutboxCDCWorker.name);
	private replicationService: LogicalReplicationService;

	constructor(
		private config: ConfigService,

		@Inject(OUTBOX_PRODUCER)
		private readonly producer: IOutboxProducer
	) {
		this.replicationService = new LogicalReplicationService(
			{ connectionString: this.config.get('DATABASE_URL') },
			{
				acknowledge: { auto: false, timeoutSeconds: 30 },
			}
		);
	}

	onApplicationBootstrap() {
		// setup service already ran by this point
		this.startWithBackoff();
	}

	async onApplicationShutdown() {
		this.logger.log('Shutting down outbox CDC worker…');
		await this.replicationService.stop();
	}

	private async startWithBackoff() {
		const INITIAL_DELAY = 500;
		const MAX_DELAY = 30_000;
		const MAX_RETRIES = Infinity;
		let attempt = 0;

		const plugin = new PgoutputPlugin({
			protoVersion: 2,
			publicationNames: ['outbox_pub'],
		});

		this.replicationService.on('data', async (lsn, log) => {
			if (log.tag !== 'insert') return;
			if (log.relation.name !== 'outbox_events') return;

			const rawEvent = log.new;

			const event = OutboxEventMapper.toOutboxEvent(rawEvent) as OutboxEvent;

			const success = await this.retryWithBackoff(
				() => this.processEvent(event),
				{ retries: 5, delay: 500 }
			);

			if (success) {
				await this.replicationService.acknowledge(lsn);
				this.logger.log(`✓ Acked LSN: ${lsn}`);
			} else {
				this.logger.error(`✗ Failed after all retries`);
			}
		});

		this.replicationService.on('error', (err) => {
			this.logger.error(`Replication error: ${err.message}`);
		});

		this.replicationService.on('start', () =>
			this.logger.log('✓ Replication started')
		);

		while (attempt < MAX_RETRIES) {
			try {
				attempt++;
				this.logger.log(`Connection attempt ${attempt}...`);
				await this.replicationService.subscribe(plugin, 'outbox_slot');
				attempt = 0;
			} catch (err) {
				const delay = Math.min(INITIAL_DELAY * 2 ** (attempt - 1), MAX_DELAY);
				this.logger.error(
					`Connection failed: ${err.message}. Retrying in ${delay}ms...`
				);
				await this.sleep(delay);
			}
		}
	}

	private async processEvent(event: OutboxEvent) {
		// wire BullMQ here in the next step
		this.logger.log(`Processing ${event.eventType}`);
		this.producer.enqueue(event);
	}

	private async retryWithBackoff(
		fn: () => Promise<void>,
		{ retries, delay }: { retries: number; delay: number }
	) {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				await fn();
				return true;
			} catch (err) {
				this.logger.error(
					`Attempt ${attempt}/${retries} failed: ${err.message}`
				);
				if (attempt < retries) {
					const backoff = Math.min(delay * 2 ** (attempt - 1), 30_000);
					await this.sleep(backoff);
				}
			}
		}
		return false;
	}

	private sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
