import { DB_CLIENT } from '@core/database/db.provider';
import { AppLogger } from '@core/logger/logger.service';
import {
	BaseRunnerService,
	type IWorkerRegistry,
	WORKER_REGISTRY,
} from '@core/worker';
import { Inject, Injectable } from '@nestjs/common';
import type { RunnerOptions } from 'graphile-worker';
import type { Pool } from 'pg';

@Injectable()
export class InboxRunnerService extends BaseRunnerService {
	constructor(
		@Inject(WORKER_REGISTRY) workerRegistry: IWorkerRegistry,
		@Inject(DB_CLIENT) dbClient: Pool,
		logger: AppLogger
	) {
		super(workerRegistry, dbClient, logger);
	}

	protected get name(): string {
		return 'Inbox Runner';
	}

	protected getRunnerOptions(
		_taskList: RunnerOptions['taskList']
	): Partial<RunnerOptions> {
		return {
			concurrency: 5,
			pollInterval: 1_000,
		};
	}
}
