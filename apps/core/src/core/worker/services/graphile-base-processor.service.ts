import { Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import type { JobHelpers } from 'graphile-worker';
// import { OTEL_TRACER } from '@core/tracer';
// import { Inject } from '@nestjs/common';
// import type { ITracer } from '@core/tracer';

import { IProcessor } from '../ports/worker.port';

/**
 * Abstract base class for all graphile-worker task handlers.
 *
 * Every feature worker should extend this class to inherit standard logging,
 * and implement:
 * - `handle()` — the job processing logic.
 *
 * The class itself should be decorated with `@GraphileTask('task_identifier')`
 * so the `GraphileExplorerService` can discover it.
 *
 * @example
 * ```ts
 * @Injectable()
 * @GraphileTask('user:sync')
 * export class UserSyncWorker extends BaseWorker<UserSyncPayload> {
 *   protected async handle(payload: UserSyncPayload, helpers: JobHelpers): Promise<void> {
 *     // validate payload, call use-case, etc.
 *   }
 * }
 * ```
 */
export abstract class BaseProcessor<TPayload = unknown>
	implements IProcessor<TPayload>
{
	constructor(
		protected readonly logger: AppLogger
		// @Inject(OTEL_TRACER) private readonly tracer: ITracer,
	) {
		this.logger.setContext(this.constructor.name);
	}

	/**
	 * Internal wrapper method called by GraphileExplorerService.
	 * Executes the task with standardized logging and error handling.
	 */
	public async execute(payload: TPayload, helpers?: JobHelpers): Promise<void> {
		//TODO: Add distributed tracing
		this.logger.log('Starting job processing');
		try {
			await this.handle(payload, helpers);
			this.logger.log('Job processed successfully');
		} catch (error) {
			this.logger.error(
				'Job execution failed:',
				error instanceof Error ? error.stack : String(error)
			);
			// Rethrow so graphile-worker registers the failure and schedules retries
			throw error;
		}
	}

	/**
	 * Process a single dequeued job.
	 *
	 * - Throw to signal failure (graphile-worker will retry up to `max_attempts`).
	 * - Return normally to signal success (job is deleted from the queue).
	 *
	 * @param payload Raw JSON payload as stored in the `graphile_worker.jobs` table.
	 * @param helpers Graphile-worker job helpers (addJob, withPgClient, logger, etc.).
	 */
	protected abstract handle(
		payload: TPayload,
		helpers?: JobHelpers
	): Promise<Result<void, Error>>;
}
