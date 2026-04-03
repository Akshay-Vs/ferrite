import { DB_CLIENT } from '@core/database/db.provider';
import { AppLogger } from '@core/logger/logger.service';
import {
	BaseRunnerService,
	type IProcessorRegistry,
	PROCESSOR_REGISTRY,
} from '@core/processor';
import { Inject, Injectable } from '@nestjs/common';
import type { RunnerOptions } from 'graphile-worker';
import type { Pool } from 'pg';

@Injectable()
export class TaskRunnerService extends BaseRunnerService {
	constructor(
		@Inject(PROCESSOR_REGISTRY) processorRegistry: IProcessorRegistry,
		@Inject(DB_CLIENT) dbClient: Pool,
		logger: AppLogger
	) {
		super(processorRegistry, dbClient, logger);
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
