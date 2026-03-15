import { WebhookEnvelope } from '@common/schemas/webhook-envelope.zodschema';
import { UserSyncEvent } from '../schemas/user-sync-event.zodschema';

// ports/webhook-mapper.port.ts
export const WEBHOOK_MAPPER = Symbol('WEBHOOK_MAPPER');

export interface IWebhookMapper {
	readonly provider: string;
	map(payload: WebhookEnvelope): UserSyncEvent | null;
}
