import { QueueParams } from '@common/schemas/queue-event.zodschema';
import { DrizzleTransaction } from '@core/database/db.type';
import { sql } from 'drizzle-orm';

export const graphileEnqueue = async (
	tx: DrizzleTransaction,
	queueParams: QueueParams
) => {
	const payload = JSON.stringify(queueParams.payload);

	await tx.execute(sql`
    SELECT graphile_worker.add_job(
      identifier := ${queueParams.identifier},
      payload := ${payload}::json,
      queue_name := ${queueParams.queueName},
      max_attempts := ${queueParams.maxAttempts}
    )
  `);
};
