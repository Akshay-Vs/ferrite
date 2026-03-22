import { AppLogger } from '@core/logger/logger.service';
import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { DB_CLIENT } from './db.provider';

@Injectable()
export class DatabaseShutdownService implements BeforeApplicationShutdown {
	constructor(
		@Inject(DB_CLIENT) private readonly dbClient: Pool,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(DatabaseShutdownService.name);
	}

	async beforeApplicationShutdown() {
		this.logger.log('Closing database connections…');
		await Promise.all([this.dbClient.end()]);
		this.logger.log('Database connections closed.');
	}
}
