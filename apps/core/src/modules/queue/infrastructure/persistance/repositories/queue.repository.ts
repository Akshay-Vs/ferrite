import { type ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';
import { IQueueRepository } from '@modules/queue/domain/ports/queue.reposotory.port';
import { QueueParams } from '@modules/queue/domain/schemas/queue-event.zodschema';
import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';

@Injectable()
export class QueueRepository implements IQueueRepository {
	async enqueue(
		tx: ITransactionContext,
		queueParams: QueueParams
	): Promise<void> {
		{
			const drizzleTx = DrizzleUnitOfWork.unwrap(tx);
			const { identifier, maxAttempts, ...jobPayloadData } = queueParams;
			const jobPayload = JSON.stringify(jobPayloadData);

			await drizzleTx.execute(sql`
        SELECT graphile_worker.add_job(
          identifier := ${identifier},
          payload := ${jobPayload}::json,
          queue_name := ${queueParams.queueName},
          max_attempts := ${maxAttempts}
        )
    `);
		}
	}
}
