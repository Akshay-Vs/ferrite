import { AuthProvider } from '@auth/index';
import { WebhookEnvelope } from '@common/schemas/webhook-envelope.zodschema';
import { UserSyncEvent } from '../schemas/user-sync-event.zodschema';

export const WEBHOOK_MAPPER = Symbol('WEBHOOK_MAPPER');

export interface IWebhookMapper {
	readonly provider: AuthProvider;
	map(payload: WebhookEnvelope): UserSyncEvent | null;
}
