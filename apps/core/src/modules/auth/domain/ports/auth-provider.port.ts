import { AuthUser } from '../types/auth-user.type';
import { RawTokenClaims } from '../types/raw-token-claims.type';
import { RawWebhookClaims } from '../types/raw-webhook-claims.type';
import { UserWebhookEvent } from '../types/webhook-event.type';
import { WebhookPayload } from '../types/webhook-payload.type';

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
	 * Verify the webhook signature from the raw HTTP envelope and return the verified claims.
	 * Must receive the unparsed body buffer — parsing before verification will break signature checks.
	 * @param payload - Raw HTTP envelope containing the unparsed body buffer and headers
	 * @returns Verified raw webhook claims
	 * @throws {UnauthorizedException} If the signature is invalid or the timestamp is outside tolerance
	 */
	verifyWebhook(payload: WebhookPayload): Promise<RawWebhookClaims>;
}

export interface IWebhookTransformer {
	/**
	 * Map verified raw webhook claims to the application-level WebhookEvent object.
	 * Pure transformation — no IO, no side effects.
	 * @param raw - Verified claims returned by IWebhookVerifier
	 * @returns A provider-agnostic user webhook event
	 * @throws {Error} If required fields are missing or the event type is unrecognised
	 */
	toWebhookEvent(raw: RawWebhookClaims): UserWebhookEvent;
}

/**
 * Port for JWT verification and transformation.
 * Consumed by: VerifyJWTUseCase
 * Implemented by: ClerkAdapter, FirebaseAdapter, KindeAdapter
 */
export interface ITokenAuth extends ITokenVerifier, ITokenTransformer {}

/**
 * Port for webhook verification and transformation.
 * Consumed by: VerifyWebhookUseCase
 * Implemented by: ClerkAdapter, FirebaseAdapter, KindeAdapter
 */ export interface IWebhookAuth
	extends IWebhookVerifier,
		IWebhookTransformer {}

/**
 * Combined adapter interface that every auth provider adapter must implement.
 * Use granular port interfaces (ITokenAuth, IWebhookAuth etc.) for
 * Auth use case dependencies — never inject IAuthAdapter directly.
 */
export type IAuthAdapter = ITokenVerifier &
	ITokenTransformer &
	IWebhookVerifier &
	IWebhookTransformer;
