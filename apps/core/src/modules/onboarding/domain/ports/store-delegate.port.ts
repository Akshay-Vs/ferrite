import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type { OnboardingStorePayload } from '@ferrite/schema';

export const STORE_DELEGATE = Symbol('STORE_DELEGATE');

/**
 * Outbound port for the Onboarding module to interact with the Store module.
 *
 * The onboarding module never imports concrete store repositories or use cases.
 * This port is implemented by an infrastructure adapter that delegates to the
 * existing Store module's repository.
 */
export interface IStoreDelegate {
	/**
	 * Create a store with an owner role and member record within the
	 * caller's transaction context.
	 *
	 * @returns The created store's ID.
	 */
	createStoreWithOwner(
		input: OnboardingStorePayload,
		createdBy: string,
		tx?: ITransactionContext
	): Promise<string>;

	/**
	 * Check whether a user already owns or is a member of any store.
	 */
	hasStores(userId: string): Promise<boolean>;
}
