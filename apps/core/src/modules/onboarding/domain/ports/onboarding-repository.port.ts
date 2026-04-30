import type { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import type {
	OnboardingSession,
	OnboardingState,
} from '../schemas/onboarding-state.zodschema';

export const ONBOARDING_REPOSITORY = Symbol('ONBOARDING_REPOSITORY');

/**
 * Persistence port for the onboarding state machine.
 *
 * All write methods accept an optional `ITransactionContext` to
 * participate in a Unit of Work transaction.
 */
export interface IOnboardingRepository {
	/**
	 * Find the onboarding session for a user.
	 * @returns The session or null if none exists.
	 */
	findByUserId(
		userId: string,
		tx?: ITransactionContext
	): Promise<OnboardingSession | null>;

	/**
	 * Idempotent upsert: creates a new session at `ABOUT_ME` if none exists,
	 * otherwise returns the existing session.
	 */
	upsert(userId: string, tx?: ITransactionContext): Promise<OnboardingSession>;

	/**
	 * Advance the onboarding state machine to a new state.
	 */
	updateState(
		userId: string,
		state: OnboardingState,
		tx?: ITransactionContext
	): Promise<void>;

	/**
	 * Mark onboarding as completed (terminal state).
	 */
	markCompleted(userId: string, tx?: ITransactionContext): Promise<void>;
}
