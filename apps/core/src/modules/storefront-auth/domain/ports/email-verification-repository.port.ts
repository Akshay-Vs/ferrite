import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type {
	CreateEmailVerificationInput,
	EmailVerification,
} from '@ferrite/schema/storefront-auth/email-verification.zodschema';

export const STOREFRONT_EMAIL_VERIFICATION_REPOSITORY = Symbol(
	'IStorefrontEmailVerificationRepository'
);

export interface IStorefrontEmailVerificationRepository {
	/**
	 * Delete any existing pending verification for this user, then insert a new one.
	 * Must run inside a transaction so both ops are atomic.
	 */
	upsert(
		data: CreateEmailVerificationInput,
		tx: ITransactionContext
	): Promise<EmailVerification>;

	/**
	 * Lookup a verification record by its hashed token.
	 * Returns null if not found or already expired.
	 */
	findByUserId(
		storeId: string,
		userId: string,
		tokenHash: string
	): Promise<EmailVerification | null>;

	/**
	 * Delete the verification record after a successful verification.
	 */
	deleteById(id: string, tx?: ITransactionContext): Promise<void>;

	/**
	 * Delete all pending verifications for a given user (e.g., before issuing a new one).
	 */
	deleteByUserId(userId: string, tx: ITransactionContext): Promise<void>;

	/**
	 * Find the most recent pending verification for a user.
	 * Used by the resend endpoint to enforce a 60-second cooldown without an extra Redis round-trip.
	 */
	findMostRecentByUserId(
		storeId: string,
		userId: string
	): Promise<EmailVerification | null>;
}
