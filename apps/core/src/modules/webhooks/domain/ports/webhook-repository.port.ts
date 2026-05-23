import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';

export const WEBHOOK_REPOSITORY = Symbol('WEBHOOK_REPOSITORY');

export interface IWebhookRepository {
	persistWebhook(payload: WebhookEnvelope): Promise<boolean>;
}
