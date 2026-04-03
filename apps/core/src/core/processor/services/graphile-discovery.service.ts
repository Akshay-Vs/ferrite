import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { TaskList } from 'graphile-worker';
import { IProcessorRegistry } from '../ports/processor-registry.port';
import { PROCESSOR_HANDLERS } from '../processor.constraints';
import { BaseProcessor } from './graphile-base-processor.service';

@Injectable()
export class GraphileDiscoveryService
	implements OnModuleInit, IProcessorRegistry
{
	private readonly logger = new Logger('GraphileTaskDiscoveryService');

	// The synthesized routing matrix
	private readonly taskList: TaskList = {};

	constructor(
		private readonly discoveryService: DiscoveryService,
		private readonly reflector: Reflector,
		@Inject(OTEL_TRACER) private readonly tracer: Pick<ITracer, 'withSpan'>
	) {}

	/**
	 * Bootstraps the task list on module initialization.
	 *
	 * Intentionally uses `process.nextTick(() => { throw err })` instead of a
	 * simple re-throw inside `.catch()` to escape the Promise chain. A re-throw
	 * inside `.catch()` would produce an unhandled rejection that NestJS silently
	 * ignores, allowing the app to boot with a broken task list. Scheduling the
	 * throw via `process.nextTick` promotes it to an uncaught exception, which
	 * crashes the process and enforces fail-fast behaviour on misconfiguration.
	 */
	onModuleInit() {
		this.synthesizeTaskList().catch((err) => {
			process.nextTick(() => {
				throw err;
			});
		});
	}

	getTaskRunners(): TaskList {
		return this.taskList;
	}

	private async synthesizeTaskList(): Promise<void> {
		return this.tracer.withSpan('worker.discovery.synthesize', async (span) => {
			const errors: string[] = [];
			const providers = this.discoveryService.getProviders();

			providers.forEach((wrapper) => {
				const { instance } = wrapper;
				if (
					!instance ||
					typeof instance === 'string' ||
					!Object.getPrototypeOf(instance)
				)
					return;

				const classTaskIdentifier = this.reflector.get<string>(
					PROCESSOR_HANDLERS,
					instance.constructor
				);
				if (!classTaskIdentifier) return;

				// Collect per-provider errors without poisoning other providers
				const providerErrors: string[] = [];

				if (this.taskList[classTaskIdentifier]) {
					providerErrors.push(
						`Duplicate task identifier: "${classTaskIdentifier}" at ${instance.constructor.name}, already mapped`
					);
				}

				if (!(instance instanceof BaseProcessor)) {
					providerErrors.push(
						`"${instance.constructor.name}" has @GraphileTask but does not extend BaseWorker`
					);
				}

				if (providerErrors.length === 0) {
					this.taskList[classTaskIdentifier] = (payload, helpers) =>
						instance.execute(payload, helpers);
					this.logger.log(
						`Mapped [${classTaskIdentifier}] -> ${instance.constructor.name}.execute`
					);
				} else {
					errors.push(...providerErrors);
				}
			});

			if (errors.length > 0) {
				const errorMessage = `Graphile Worker configuration has ${errors.length} error(s):\n  - ${errors.join('\n  - ')}`;
				this.logger.error(errorMessage);
				throw new Error(errorMessage);
			}

			span.setAttributes({
				'worker.discovery.count': Object.keys(this.taskList).length,
			});
			this.logger.log(
				`Discovered ${Object.keys(this.getTaskRunners()).length} worker(s): [${Object.keys(this.getTaskRunners()).join(', ')}]`
			);
		});
	}
}
