import {
	type WebhookEnvelope,
	webhookEnvelopeSchema,
} from '@common/schemas/webhook-envelope.zodschema';

// Alias for backwards compatibility
export { webhookEnvelopeSchema as webhookPayloadSchema };
export type { WebhookEnvelope as WebhookPayload };
