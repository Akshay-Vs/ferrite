import { DrizzleTransaction } from '@core/database/db.type';
import { QueueParams } from '../schemas/queue-event.zodschema';

export const QUEUE_REPOSITORY = Symbol('QUEUE_REPOSITORY');

export interface IQueueRepository {
	enqueue(tx: DrizzleTransaction, queueParams: QueueParams): Promise<void>;
}
