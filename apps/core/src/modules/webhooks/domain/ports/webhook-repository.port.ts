import { WebhookPayload } from '@auth/index';

export const WEBHOOK_REPOSITORY = Symbol('WEBHOOK_REPOSITORY');

export interface IWebhookRepository {
	persistWebhook(payload: WebhookPayload): Promise<boolean>;
}
