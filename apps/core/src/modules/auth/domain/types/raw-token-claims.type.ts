import { JwtClaims } from '@common/types/jwt-claims.type';

/**
 * Raw claims returned by the token verifier.
 */
export interface RawTokenClaims extends JwtClaims {
	sub: string;
	email: string;
	email_verified: boolean;
	full_name?: string | undefined;
	metadata?: Record<string, unknown>;
}
