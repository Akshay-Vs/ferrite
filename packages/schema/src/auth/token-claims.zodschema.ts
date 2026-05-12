import { z } from 'zod/v4';
import { jwtClaims } from '../common/jwt-claims.zodschema';
import { publicMetadataSchema } from './public-metadata.zodschema';

export const rawTokenClaimsSchema = z
	.object({
		sub: z.string(),
		email: z.string(),
		email_verified: z.boolean(),
		full_name: z.string().optional(),
		metadata: publicMetadataSchema,
	})
	.and(jwtClaims);

export type RawTokenClaims = z.infer<typeof rawTokenClaimsSchema>;
