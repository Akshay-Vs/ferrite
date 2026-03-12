import { WebhookPayload } from '@common/types/webhook-payload.type';
import { AuthUser, RawTokenClaims, RawWebhookClaims } from '../schemas';

export interface ITokenVerifier {
	/**
	 * Cryptographically verify the JWT signature and return the verified claims.
	 * @param token - The raw JWT string from the Authorization header
	 * @returns Verified and decoded token claims
	 * @throws {UnauthorizedException} If the signature is invalid or the token is expired
	 */
	verifyJWT(token: string): Promise<RawTokenClaims>;
}

export interface ITokenTransformer {
	/**
	 * Map verified raw token claims to the application-level AuthUser object.
	 * Pure transformation — no IO, no side effects.
	 * @param claims - Verified claims returned by ITokenVerifier
	 * @returns A provider-agnostic AuthUser
	 * @throws {Error} If required claims are missing or malformed
	 */
	toAuthUser(claims: RawTokenClaims): AuthUser;
}

export interface IWebhookVerifier {
	/**
	 * Verify the webhook signature from the HTTP request.
	 * @param payload - Raw HTTP envelope containing the unparsed body buffer and headers
	 * @returns RawWebhookClaims if the signature is valid
	 * @throws {BadRequestException} If the signature is missing or malformed
	 * @throws {UnauthorizedException} If the signature is invalid or the timestamp is outside tolerance
	 */
	verifyWebhook(payload: WebhookPayload): Promise<RawWebhookClaims>;
}

export interface IWebhookParser {
	/**
	 * Parse the raw webhook claims into a more structured object using Zod.
	 * Pure validation — no IO, no side effects.
	 * @param claims - Raw webhook claims returned by IWebhookVerifier
	 * @returns A parsed and validated webhook event
	 */
	zodParse(claims: RawWebhookClaims): any;
}

/**
 * Port for JWT verification and transformation.
 * Consumed by: VerifyJWTUseCase
 * Implemented by: ClerkAdapter, FirebaseAdapter, KindeAdapter
 */
export interface ITokenAuth extends ITokenVerifier, ITokenTransformer {}

/**
 * Composed port for webhook verification.
 * Mirrors ITokenAuth naming convention for consistency.
 * Extend this if webhook transformation is added in future.
 * Consumed by: VerifyWebhookUseCase
 * Implemented by: ClerkAdapter, KindeAdapter etc
 */
export interface IWebhookAuth extends IWebhookVerifier, IWebhookParser {}
