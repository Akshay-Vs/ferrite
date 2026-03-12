import { z } from 'zod/v4';

export const jwtClaims = z.object({
	iss: z.string().optional(),
	sub: z.string().optional(),
	aud: z.union([z.string(), z.array(z.string())]).optional(),
	exp: z.number().optional(),
	nbf: z.number().optional(),
	iat: z.number().optional(),
	jti: z.string().optional(),
});

export type JwtClaims = z.infer<typeof jwtClaims>;
