import { Result } from '@common/interfaces/result.interface';
import { RawWebhookRequest } from '@common/types/webhook-payload.type';
import { AuthUser, RawTokenClaims } from '@ferrite/schema/auth/index';
import { UserUpdatePayload } from '@ferrite/schema/auth/user-update-payload.zodschema';
import { WebhookEnvelope } from '@ferrite/schema/common/webhook-envelope.zodschema';
import { DeleteUserError } from '../errors/delete-user.error';
import { InvalidTokenError } from '../errors/invalid-token.error';
import { InvalidWebhookPayloadError } from '../errors/invalid-webhook-payload.error';
import { UpdateUserError } from '../errors/update-user.error';
import { WebhookVerificationError } from '../errors/webhook-verification.error';

export interface ITokenVerifier {
	/**
	 * Cryptographically verify the JWT signature and return the verified claims.
	 * @param token - The raw JWT string from the Authorization header
	 * @returns A Result containing the verified and decoded token claims, or an InvalidTokenError
	 */
	verifyJWT(token: string): Promise<Result<RawTokenClaims, InvalidTokenError>>;
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
	 * @returns A Result containing WebhookPayload if the signature is valid, or an error
	 */
	verifyWebhook(
		payload: RawWebhookRequest
	): Promise<
		Result<
			WebhookEnvelope,
			InvalidWebhookPayloadError | WebhookVerificationError
		>
	>;
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
export interface IWebhookAuth extends IWebhookVerifier {}

/**
 * Port for user deletion.
 * Used to delete user from third-party auth providers.
 * Implemented by: ClerkAdapter, KindeAdapter etc
 */
export interface IDeleteUser {
	deleteUser(externalAuthId: string): Promise<Result<void, DeleteUserError>>;
}

/**
 * Port for user update.
 * Used to update user profile fields in third-party auth providers.
 * Implemented by: ClerkAdapter, KindeAdapter etc
 */
export interface IUpdateUser {
	updateUser(
		externalAuthId: string,
		payload: UserUpdatePayload
	): Promise<Result<void, UpdateUserError>>;
}
