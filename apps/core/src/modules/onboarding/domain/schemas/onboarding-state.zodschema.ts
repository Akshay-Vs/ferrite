import { z } from 'zod/v4';

export const OnboardingState = z.enum([
	'ABOUT_ME',
	'STORE_CREATION',
	'COMPLETED',
]);
export type OnboardingState = z.infer<typeof OnboardingState>;

export const onboardingSessionSchema = z.object({
	userId: z.uuid(),
	currentStep: OnboardingState,
	isCompleted: z.boolean(),
	stepData: z.record(z.string(), z.unknown()).optional(),
});
export type OnboardingSession = z.infer<typeof onboardingSessionSchema>;
