import { Result } from '@common/interfaces/result.interface';
import { DrizzleTransaction } from '@core/database/db.type';
import { QueueParams } from '../schemas/queue-event.zodschema';

export const ENQUEUE_GRAPHILE_EVENT_UC = Symbol('ENQUEUE_GRAPHILE_EVENT');

export interface IEnqueue {
	execute(
		tx: DrizzleTransaction,
		queueParams: QueueParams
	): Promise<Result<void, Error>>;
}
