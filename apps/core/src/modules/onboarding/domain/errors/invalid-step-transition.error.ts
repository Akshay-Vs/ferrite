import type { OnboardingState } from '@ferrite/schema/onboarding/onboarding-session.zodschema';

export class InvalidStepTransitionError extends Error {
	readonly _tag = 'InvalidStepTransitionError';

	constructor(
		readonly currentStep: OnboardingState,
		readonly expectedStep: OnboardingState
	) {
		super(
			`Invalid step transition: user is at '${currentStep}', expected '${expectedStep}'`
		);
	}
}
