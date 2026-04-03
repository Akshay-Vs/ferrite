import { err, ok, Result } from '@common/interfaces/result.interface';
import { DrizzleTransaction } from '@core/database/db.type';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import {
	type IQueueRepository,
	QUEUE_REPOSITORY,
} from '@modules/queue/domain/ports/queue.reposotory.port';
import { IEnqueue } from '@modules/queue/domain/ports/use-cases.port';
import { QueueParams } from '@modules/queue/domain/schemas/queue-event.zodschema';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GraphileEnqueueEvent implements IEnqueue {
	constructor(
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(QUEUE_REPOSITORY) private readonly repo: IQueueRepository,
		private readonly logger: AppLogger
	) {}

	async execute(
		tx: DrizzleTransaction,
		queueParams: QueueParams
	): Promise<Result<void, Error>> {
		return this.tracer.withSpan('use-case.enqueue-graphile-event', async () => {
			try {
				const res = await this.repo.enqueue(tx, queueParams);
				return ok(res);
			} catch (error: any) {
				this.logger.error(
					`Failed to enqueue graphile event: queueParams=${queueParams}`,
					error //? error.stack : String(error)
				);
				return err(new Error('Failed to enqueue graphile event'));
			}
		});
	}
}
