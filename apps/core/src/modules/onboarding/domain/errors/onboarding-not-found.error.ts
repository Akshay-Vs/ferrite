export class OnboardingNotFoundError extends Error {
	readonly _tag = 'OnboardingNotFoundError';

	constructor(userId: string) {
		super(`No onboarding record found for user ${userId}`);
	}
}
