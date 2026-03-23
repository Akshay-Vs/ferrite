import { exponentialBackoff } from '@libs/backoff/exponential-backoff';
import { Logger } from '@nestjs/common';
import {
	LogicalReplicationService,
	PgoutputPlugin,
} from 'pg-logical-replication';

export interface ReplicationSubscriberOptions {
	slotName: string;
	publicationNames: string[];
	protoVersion?: 1 | 2;
	initialDelay?: number;
	maxDelay?: number;
}

/**
 * Manages the logical replication connection lifecycle with
 * exponential backoff reconnection. Decoupled from any business logic.
 */
export class ReplicationSubscriber {
	private attempt = 0;

	constructor(
		private readonly service: LogicalReplicationService,
		private readonly logger: Logger,
		private readonly options: ReplicationSubscriberOptions
	) {}

	async start(): Promise<void> {
		const {
			slotName,
			publicationNames,
			protoVersion = 2,
			initialDelay = 500,
			maxDelay = 30_000,
		} = this.options;

		const plugin = new PgoutputPlugin({ protoVersion, publicationNames });

		while (true) {
			try {
				this.attempt++;
				this.logger.log(`Connection attempt ${this.attempt}...`);
				await this.service.subscribe(plugin, slotName);
				this.attempt = 0; // reset on clean disconnect
			} catch (err) {
				const delay = exponentialBackoff({
					initialDelay,
					maxDelay,
					attempt: this.attempt,
				});
				this.logger.error(
					`Connection failed: ${(err as Error).message}. Retrying in ${delay}ms...`
				);
				await this.sleep(delay);
			}
		}
	}

	private sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
