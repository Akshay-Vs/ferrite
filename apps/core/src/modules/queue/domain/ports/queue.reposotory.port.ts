import { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { QueueParams } from '../schemas/queue-event.zodschema';

export const QUEUE_REPOSITORY = Symbol('QUEUE_REPOSITORY');

export interface IQueueRepository {
	enqueue(tx: ITransactionContext, queueParams: QueueParams): Promise<void>;
}
