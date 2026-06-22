import { Result } from '@common/interfaces/result.interface';
import { StorefrontUser } from '@ferrite/schema/storefront-auth/storefront-user.zodschema';
import { InvalidTokenError } from '../errors/invalid-token.error';

export interface IStorefrontTokenAuth {
	/**
	 * Verify a storefront user's session or token and return the `StorefrontUser`.
	 * This verifies the user against the storefront Identity Provider (e.g., Supabase, BetterAuth).
	 */
	verifyToken(
		token: string
	): Promise<Result<StorefrontUser, InvalidTokenError>>;
}
