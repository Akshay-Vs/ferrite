import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg'; // plain pg, not postgres.js

@Injectable()
export class OutboxReplicationSetupService implements OnApplicationBootstrap {
	private readonly logger = new Logger(OutboxReplicationSetupService.name);

	constructor(private config: ConfigService) {}

	async onApplicationBootstrap() {
		// plain pg client — runs outside any transaction
		const client = new Client({
			connectionString: this.config.getOrThrow('DATABASE_URL'),
		});

		try {
			await client.connect();
			await this.ensurePublication(client);
			await this.ensureReplicationSlot(client);
		} finally {
			await client.end(); // always close, this client is only for setup
		}
	}

	private async ensurePublication(client: Client) {
		try {
			await client.query(`
        CREATE PUBLICATION outbox_pub FOR TABLE outbox_events
      `);
			this.logger.log('✓ Publication created');
		} catch (error: any) {
			if (error.code === '42P07' || error.code === '42710') {
				this.logger.log('✓ Publication already exists');
			} else {
				throw error;
			}
		}
	}

	private async ensureReplicationSlot(client: Client) {
		try {
			// this is why we need plain pg — must run outside a transaction
			// postgres.js wraps everything in transactions, this would fail
			await client.query(`
        SELECT pg_create_logical_replication_slot('outbox_slot', 'pgoutput')
      `);
			this.logger.log('✓ Replication slot created');
		} catch (error: any) {
			if (error.code === '42P07' || error.code === '42710') {
				this.logger.log('✓ Replication slot already exists');
			} else {
				throw error;
			}
		}
	}
}
