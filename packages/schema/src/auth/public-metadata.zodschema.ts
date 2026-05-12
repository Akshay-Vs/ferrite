import z from 'zod/v4';
import { OnboardingState } from '../onboarding/onboarding-session.zodschema';

export const publicMetadataSchema = z
	.object({
		role: z.string(),
		onBoardingState: OnboardingState,
	})
	.partial();

export type PublicMetadata = z.infer<typeof publicMetadataSchema>;
