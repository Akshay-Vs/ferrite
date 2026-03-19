import type { WebhookPayload } from '@auth/index';

export const USER_SYNC_PRODUCER = Symbol('IUserSyncProducer');

/**
 * Driven port for enqueuing user-sync jobs.
 *
 * Consumed by: WebhookRouterUsecase
 * Implemented by: UserSyncProducer (BullMQ adapter)
 */
export interface IUserSyncProducer {
	/**
	 * Enqueue a webhook payload for asynchronous processing.
	 * @param data     Verified webhook payload to enqueue.
	 * @param jobName  Human-readable job name used for observability.
	 */
	enqueue(data: WebhookPayload, jobName: string): Promise<void>;
}
