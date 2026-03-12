import { jwtClaims } from '@common/schemas/jwt-claims.zodschema';
import { z } from 'zod/v4';

export const rawTokenClaimsSchema = z
	.object({
		sub: z.string(),
		email: z.string(),
		email_verified: z.boolean(),
		full_name: z.string().optional(),
		metadata: z.record(z.union([z.string(), z.number()]), z.unknown()),
	})
	.and(jwtClaims);

export type RawTokenClaims = z.infer<typeof rawTokenClaimsSchema>;
