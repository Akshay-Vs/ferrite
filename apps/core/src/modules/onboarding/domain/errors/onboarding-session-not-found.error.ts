export class OnboardingSessionNotFoundError extends Error {
	readonly _tag = 'OnboardingSessionNotFoundError';

	constructor(userId: string) {
		super(`No onboarding session for user ${userId}`);
	}
}
