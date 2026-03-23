import type { ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer';
import { ConcurrencyLimiter } from '@libs/limiters/concurrency-limiter';
import { OrderedAckQueue } from '@libs/replication/ordered-ack-queue';
import { ReplicationSubscriber } from '@libs/replication/replication-subscriber';
import { retryWithBackoff } from '@libs/retry/retry-with-backoff';
import {
	type IOutboxProducer,
	OUTBOX_PRODUCER,
} from '@modules/outbox/domain/ports/outbox-producer.port';
import { type OutboxEvent } from '@modules/outbox/domain/schemas/outbox-event.zodschema';
import {
	Inject,
	Injectable,
	Logger,
	OnApplicationBootstrap,
	OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogicalReplicationService } from 'pg-logical-replication';
import { OutboxEventMapper } from '../persistance/mappers/outbox-event.mapper';

@Injectable()
export class OutboxCDCWorker
	implements OnApplicationBootstrap, OnApplicationShutdown
{
	private readonly logger = new Logger(OutboxCDCWorker.name);
	private readonly replicationService: LogicalReplicationService;
	private readonly ackQueue: OrderedAckQueue;
	private readonly subscriber: ReplicationSubscriber;
	private readonly limiter: ConcurrencyLimiter;
	private readonly DEFAULT_CONCURRENCY = 5;

	constructor(
		private config: ConfigService,
		@Inject(OUTBOX_PRODUCER) private readonly producer: IOutboxProducer,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {
		this.replicationService = new LogicalReplicationService(
			{ connectionString: this.config.getOrThrow('DATABASE_URL') },
			{ acknowledge: { auto: false, timeoutSeconds: 30 } }
		);

		this.ackQueue = new OrderedAckQueue(this.logger, {
			batchSize: 100,
			flushIntervalMs: 1000,
		});

		this.limiter = new ConcurrencyLimiter(
			this.config.get<number>('CDC_CONCURRENCY') ?? this.DEFAULT_CONCURRENCY
		);

		this.subscriber = new ReplicationSubscriber(
			this.replicationService,
			this.logger,
			{
				slotName: 'outbox_slot',
				publicationNames: ['outbox_pub'],
				protoVersion: 2,
			}
		);
	}

	onApplicationBootstrap() {
		this.registerHandlers();
		this.subscriber.start(); // start connection
	}

	async onApplicationShutdown() {
		this.logger.log('Draining ack queue before shutdown...');
		try {
			await this.ackQueue.drain(); // wait for all pending acks and flush
			this.logger.log('Ack queue drained');
		} catch {
			this.logger.log('Drain failed, shutting down anyway');
		}
		await this.replicationService.stop();
	}
	private registerHandlers() {
		this.replicationService.on('data', (lsn, log) => {
			if (log.tag !== 'insert') return;
			if (log.relation.name !== 'outbox_events') return;

			const event = OutboxEventMapper.toOutboxEvent(log.new) as OutboxEvent;

			const processingPromise = this.limiter.run(() =>
				retryWithBackoff(() => this.processEvent(event), {
					retries: 5,
					logger: this.logger,
				})
			);

			this.ackQueue.enqueue(
				processingPromise.then(() => true),
				() => this.replicationService.acknowledge(lsn),
				lsn
			);
		});

		this.replicationService.on('error', (err) =>
			this.logger.error(`Replication error: ${err.message}`)
		);

		this.replicationService.on('start', () =>
			this.logger.log('✓ Replication started')
		);
	}

	private async processEvent(event: OutboxEvent) {
		await this.tracer.withPropagatedSpan(
			'outbox.cdc.process',
			event.__traceContext,
			async () => {
				await this.producer.enqueue(event);
			},
			undefined,
			{
				'outbox.event_type': event.eventType,
				'outbox.queue_name': event.queueName,
				'outbox.aggregate_type': event.aggregateType,
				'outbox.aggregate_id': event.aggregateId,
				'outbox.event_id': event.eventId,
			}
		);
	}
}
