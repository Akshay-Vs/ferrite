import z from 'zod/v4';
import { authProvidersSchema } from '../auth/auth-providers.zodschema';
import { eventPayloadSchema } from './event-payload.zodschema';

// RAW WEBHOOK ENVELOPE (provider-agnostic)
export const webhookEnvelopeSchema = z
	.object({
		provider: authProvidersSchema,
		timestamp: z.number().int().nonnegative(),
	})
	.extend(eventPayloadSchema.shape)
	.extend({
		queueName: z.string().min(1),
	});

export type WebhookEnvelope = z.infer<typeof webhookEnvelopeSchema>;
