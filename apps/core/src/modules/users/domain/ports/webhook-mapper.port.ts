import { AuthProvider } from '@auth/index';
import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';
import { UserSyncEvent } from '@ferrite/schema/users/user-sync-event.zodschema';

export const WEBHOOK_MAPPER = Symbol('WEBHOOK_MAPPER');

export interface IWebhookMapper {
	readonly provider: AuthProvider;
	map(payload: WebhookEnvelope): UserSyncEvent | null;
}
