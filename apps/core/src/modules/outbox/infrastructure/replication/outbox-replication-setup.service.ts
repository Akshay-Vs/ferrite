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
			connectionString: this.config.get('DATABASE_URL'),
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
		const { rows } = await client.query(`
      SELECT pubname FROM pg_publication WHERE pubname = 'outbox_pub'
    `);

		if (rows.length === 0) {
			await client.query(`
        CREATE PUBLICATION outbox_pub FOR TABLE outbox_events
      `);
			this.logger.log('✓ Publication created');
		} else {
			this.logger.log('✓ Publication already exists');
		}
	}

	private async ensureReplicationSlot(client: Client) {
		const { rows } = await client.query(`
      SELECT slot_name FROM pg_replication_slots
      WHERE slot_name = 'outbox_slot'
    `);

		if (rows.length === 0) {
			// this is why we need plain pg — must run outside a transaction
			// postgres.js wraps everything in transactions, this would fail
			await client.query(`
        SELECT pg_create_logical_replication_slot('outbox_slot', 'pgoutput')
      `);
			this.logger.log('✓ Replication slot created');
		} else {
			this.logger.log('✓ Replication slot already exists');
		}
	}
}
