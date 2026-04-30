import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { SubmitAboutMeInput } from '../schemas/submit-about-me.zodschema';

export const USER_DELEGATE = Symbol('USER_DELEGATE');

/**
 * Outbound port for the Onboarding module to interact with the Users module.
 *
 * The onboarding module never imports concrete user repositories or use cases.
 * This port is implemented by an infrastructure adapter that delegates to the
 * existing User module's repository.
 */
export interface IUserDelegate {
	/**
	 * Update profile fields and enqueue a sync event within the caller's
	 * transaction context so the auth provider stays in sync.
	 *
	 * @param userId       Internal user UUID.
	 * @param data         Profile fields to update.
	 * @param externalAuthId  The user's external auth provider ID (needed for outbox event).
	 * @param provider     Auth provider name (e.g. 'clerk').
	 * @param tx           Optional UoW transaction context.
	 */
	updateProfile(
		userId: string,
		data: SubmitAboutMeInput,
		externalAuthId: string,
		provider: string,
		tx?: ITransactionContext
	): Promise<void>;

	/**
	 * Check if the user exists and has a populated name.
	 */
	findById(
		userId: string
	): Promise<{ firstName: string | null; lastName: string | null } | null>;
}
