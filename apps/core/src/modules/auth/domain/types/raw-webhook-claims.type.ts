import { WebhookEventType } from './webhook-event.type';

/**
 * Raw claims returned by the webhook verifier.
 */
export interface RawWebhookClaims {
	event_id: string;
	event_type: WebhookEventType;
	timestamp: number;
	data: Record<string, unknown>;
}
