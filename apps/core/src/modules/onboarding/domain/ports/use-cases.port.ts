import type { AuthUser } from '@auth/domain/schemas/auth-user.zodschema';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import type {
	OnboardingAboutUser,
	OnboardingStoreCreate,
} from '@ferrite/schema';
import type { InvalidStepTransitionError } from '../errors/invalid-step-transition.error';
import type { OnboardingAlreadyCompletedError } from '../errors/onboarding-already-completed.error';
import type { OnboardingSession } from '../schemas/onboarding-state.zodschema';

// ─────────────────────────────────────────
// DI TOKENS
// ─────────────────────────────────────────

export const GET_ONBOARDING_SESSION_UC = Symbol('GET_ONBOARDING_SESSION_UC');
export const SUBMIT_ABOUT_ME_UC = Symbol('SUBMIT_ABOUT_ME_UC');
export const SUBMIT_STORE_CREATION_UC = Symbol('SUBMIT_STORE_CREATION_UC');

// ─────────────────────────────────────────
// USE CASE TYPE ALIASES
// ─────────────────────────────────────────

/**
 * Reads (or lazily creates) the user's onboarding session.
 */
export type IGetOnboardingSessionUseCase = IUseCase<
	AuthUser,
	OnboardingSession,
	Error
>;

/**
 * Submits the "About Me" step: updates user profile + advances state.
 */
export type ISubmitAboutMeUseCase = IUseCase<
	{ authUser: AuthUser; data: OnboardingAboutUser },
	OnboardingSession,
	InvalidStepTransitionError | OnboardingAlreadyCompletedError | Error
>;

/**
 * Submits the "Store Creation" step: creates store + completes onboarding.
 */
export type ISubmitStoreCreationUseCase = IUseCase<
	{ authUser: AuthUser; data: OnboardingStoreCreate },
	OnboardingSession,
	InvalidStepTransitionError | OnboardingAlreadyCompletedError | Error
>;
