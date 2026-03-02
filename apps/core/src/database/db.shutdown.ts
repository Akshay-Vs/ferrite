import {
	BeforeApplicationShutdown,
	Inject,
	Injectable,
	Logger,
} from '@nestjs/common';
import type { Sql } from 'postgres';
import { DB_CLIENT, SUBSCRIBER_CLIENT } from './db.provider';

@Injectable()
export class DatabaseShutdownService implements BeforeApplicationShutdown {
	private readonly logger = new Logger(DatabaseShutdownService.name);

	constructor(
		@Inject(DB_CLIENT) private readonly dbClient: Sql,
		@Inject(SUBSCRIBER_CLIENT) private readonly subscriberClient: Sql
	) {}

	async beforeApplicationShutdown() {
		this.logger.log('Closing database connections…');
		await Promise.all([this.dbClient.end(), this.subscriberClient.end()]);
		this.logger.log('Database connections closed.');
	}
}
