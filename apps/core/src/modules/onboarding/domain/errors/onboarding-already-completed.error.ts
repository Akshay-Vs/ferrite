export class OnboardingAlreadyCompletedError extends Error {
	readonly _tag = 'OnboardingAlreadyCompletedError';

	constructor(userId: string) {
		super(`Onboarding already completed for user ${userId}`);
	}
}
