import type { OnboardingState } from '../schemas/onboarding-state.zodschema';

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
