import { AppLogger } from '@core/logger/logger.service';
import { type IProcessorRegistry } from '@core/processor/ports/processor-registry.port';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import {
	Inject,
	type OnApplicationBootstrap,
	type OnApplicationShutdown,
} from '@nestjs/common';
import { type Runner, type RunnerOptions, run } from 'graphile-worker';
import type { Pool } from 'pg';

export abstract class BaseRunnerService
	implements OnApplicationBootstrap, OnApplicationShutdown
{
	@Inject(OTEL_TRACER)
	protected readonly tracer!: ITracer;

	protected runner?: Runner;

	constructor(
		protected readonly workerRegistry: IProcessorRegistry,
		protected readonly dbClient: Pool,
		protected readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	/**
	 * Returns the display name of this runner for logging purposes.
	 */
	protected abstract get name(): string;

	/**
	 * Provides configuration options for the graphile-worker Runner.
	 * The base class automatically injects `pgPool` and `taskList`.
	 * Subclasses can override or add options like `concurrency` or `pollInterval`.
	 *
	 * @param taskList - The full list of discovered tasks from the registry.
	 *                   Subclasses may filter this object if they only want to
	 *                   process a subset of queues.
	 */
	protected abstract getRunnerOptions(
		taskList: RunnerOptions['taskList']
	): Partial<RunnerOptions>;

	async onApplicationBootstrap(): Promise<void> {
		return this.tracer.withSpan(
			`worker.runner.start.${this.name}`,
			async (span) => {
				const fullTaskList = this.workerRegistry.getTaskRunners();

				const options = this.getRunnerOptions(fullTaskList);
				const activeTaskList = options.taskList || fullTaskList;
				const queueNames = Object.keys(activeTaskList as Record<string, any>);

				if (queueNames.length === 0) {
					const msg = `No tasks configured — ${this.name} will not start`;
					this.logger.warn(msg);
					span.setAttributes({ 'worker.runner.skipped': true });
					return;
				}

				span.setAttributes({ 'worker.runner.queuesCount': queueNames.length });
				this.logger.log(
					`Starting ${this.name} with ${queueNames.length} route(s): [${queueNames.join(', ')}]`
				);

				this.runner = await run({
					pgPool: this.dbClient,
					taskList: fullTaskList,
					...options,
				});

				this.logger.log(`${this.name} started`);
			}
		);
	}

	async onApplicationShutdown(): Promise<void> {
		try {
			if (this.runner) {
				await this.tracer.withSpan(
					`worker.runner.stop.${this.name}`,
					async () => {
						this.logger.log(`Stopping ${this.name}`);
						await this.runner?.stop();
					}
				);
			}
		} catch (err: any) {
			this.logger.error(err.message);
		}
	}
}
