import {
	type WebhookEnvelope,
	webhookEnvelopeSchema,
} from '@common/schemas/webhook-envelope.zodschema';

// Alias for backwards compatibility
/**
 * @deprecated Use `webhookEnvelopeSchema` instead.
 */
export const webhookPayloadSchema = webhookEnvelopeSchema;
/**
 * @deprecated Use `WebhookEnvelope` instead.
 */
export type WebhookPayload = WebhookEnvelope;
