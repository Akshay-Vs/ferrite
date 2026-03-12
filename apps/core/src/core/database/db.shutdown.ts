import { AppLogger } from '@core/logger/logger.service';
import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { DB_CLIENT, SUBSCRIBER_CLIENT } from './db.provider';

@Injectable()
export class DatabaseShutdownService implements BeforeApplicationShutdown {
	constructor(
		@Inject(DB_CLIENT) private readonly dbClient: Sql,
		@Inject(SUBSCRIBER_CLIENT) private readonly subscriberClient: Sql,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(DatabaseShutdownService.name);
	}

	async beforeApplicationShutdown() {
		this.logger.log('Closing database connections…');
		await Promise.all([this.dbClient.end(), this.subscriberClient.end()]);
		this.logger.log('Database connections closed.');
	}
}
