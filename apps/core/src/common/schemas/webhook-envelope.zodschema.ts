import { authProvidersSchema } from '@auth/domain/schemas/auth-providers.zodschema';
import z from 'zod/v4';

// RAW WEBHOOK ENVELOPE (provider-agnostic)
export const webhookEnvelopeSchema = z.object({
	provider: authProvidersSchema,
	eventId: z.string().min(1),
	eventType: z.string().min(1),
	timestamp: z.number().int().nonnegative(),
	data: z.record(z.string(), z.unknown()),
	__traceContext: z.record(z.string(), z.string()).optional(),
});

export type WebhookEnvelope = z.infer<typeof webhookEnvelopeSchema>;
