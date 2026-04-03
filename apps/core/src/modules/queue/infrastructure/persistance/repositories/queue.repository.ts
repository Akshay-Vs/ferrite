import { DrizzleTransaction } from '@core/database/db.type';
import { IQueueRepository } from '@modules/queue/domain/ports/queue.reposotory.port';
import { QueueParams } from '@modules/queue/domain/schemas/queue-event.zodschema';
import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';

@Injectable()
export class QueueRepository implements IQueueRepository {
	async enqueue(
		tx: DrizzleTransaction,
		queueParams: QueueParams
	): Promise<void> {
		{
			const { identifier, maxAttempts, ...jobPayloadData } = queueParams;
			const jobPayload = JSON.stringify(jobPayloadData);

			await tx.execute(sql`
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
