import { authProvidersSchema } from '@auth/domain/schemas/auth-providers.zodschema';
import z from 'zod/v4';
import { eventPayloadSchema } from './event-payload.zodschema';

// RAW WEBHOOK ENVELOPE (provider-agnostic)
export const webhookEnvelopeSchema = z
	.object({
		provider: authProvidersSchema,
		timestamp: z.number().int().nonnegative(),
		__traceContext: z.record(z.string(), z.string()).optional(),
	})
	.extend(eventPayloadSchema.shape);

export type WebhookEnvelope = z.infer<typeof webhookEnvelopeSchema>;
