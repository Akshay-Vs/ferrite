import { Logger } from '@nestjs/common';

type AckFn = () => Promise<boolean> | Promise<void> | void;

export interface OrderedAckQueueOptions {
	batchSize?: number;
	flushIntervalMs?: number;
}

/**
 * Ensures acknowledgement calls are always issued in strict arrival order,
 * regardless of how long each item takes to process concurrently.
 *
 * It batches acknowledgements to reduce the number of calls, thus
 * reducing write pressure on the replication source.
 *
 * Usage:
 *   const queue = new OrderedAckQueue(logger, { batchSize: 100, flushIntervalMs: 1000 });
 *   const processingPromise = startProcessing(event);
 *   queue.enqueue(processingPromise, () => service.acknowledge(lsn), lsn);
 */
export class OrderedAckQueue {
	nextAckPromise: Promise<void> = Promise.resolve();

	private pendingAcks = 0;
	private lastAckFn: AckFn | null = null;
	private lastLsn: string | null = null;
	private flushTimeout: NodeJS.Timeout | null = null;

	private readonly batchSize: number;
	private readonly flushIntervalMs: number;

	constructor(
		private readonly logger: Logger,
		options: OrderedAckQueueOptions = {}
	) {
		this.batchSize = options.batchSize ?? 100;
		this.flushIntervalMs = options.flushIntervalMs ?? 1000;
	}

	enqueue(processingPromise: Promise<boolean>, ack: AckFn, lsn: string): void {
		this.nextAckPromise = this.nextAckPromise.then(async () => {
			const success = await processingPromise;

			// success===false means the caller already dead-lettered the event
			// in the DB. We still advance the LSN so the pipeline is never blocked.
			if (!success) {
				this.logger.warn(`Event dead-lettered; advancing LSN anyway: ${lsn}`);
			}

			this.lastAckFn = ack;
			this.lastLsn = lsn;
			this.pendingAcks++;

			if (this.pendingAcks >= this.batchSize) {
				await this.flush();
			} else if (!this.flushTimeout) {
				this.flushTimeout = setTimeout(() => {
					this.flushTimeout = null;
					this.nextAckPromise = this.nextAckPromise.then(() => this.flush());
				}, this.flushIntervalMs);
			}
		});
	}

	async drain(): Promise<void> {
		await this.nextAckPromise;
		await this.flush();
	}

	private async flush(): Promise<void> {
		if (this.flushTimeout) {
			clearTimeout(this.flushTimeout);
			this.flushTimeout = null;
		}

		if (this.pendingAcks === 0 || !this.lastAckFn || !this.lastLsn) {
			return;
		}

		const ackFn = this.lastAckFn;
		const lsn = this.lastLsn;
		const count = this.pendingAcks;

		this.lastAckFn = null;
		this.lastLsn = null;
		this.pendingAcks = 0;

		try {
			await ackFn();
			this.logger.log(`✓ Acked ${count} events up to LSN: ${lsn}`);
		} catch (err) {
			this.logger.error(`✗ Failed to acknowledge LSN: ${lsn}`);
			throw err;
		}
	}
}
