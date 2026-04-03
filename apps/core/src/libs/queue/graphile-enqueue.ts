import { QueueParams } from '@common/schemas/queue-event.zodschema';
import { DrizzleTransaction } from '@core/database/db.type';
import { sql } from 'drizzle-orm';

export const graphileEnqueue = async (
	tx: DrizzleTransaction,
	queueParams: QueueParams
) => {
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
};
