import { auth } from '@clerk/nextjs/server';
import { OnboardingService } from '@ferrite/api';
import type { OnboardingSession } from '@ferrite/schema';
import type { PublicMetadata } from '@ferrite/schema/auth/public-metadata.zodschema';
import { getFerriteClient } from '@/core/utils/ferrite-client';

/**
 * Resolves the current onboarding state using a hybrid check.
 * Prioritizes the session JWT (Fast Path) and falls back to the Ferrite API.
 */
export async function resolveOnboardingState(): Promise<
	OnboardingSession['currentStep']
> {
	const { sessionClaims, getToken } = await auth();

	// Fast Path: Evaluate augmented JWT metadata
	const cachedState = (sessionClaims?.public_metadata as PublicMetadata)
		.onBoardingState;
	if (cachedState === 'COMPLETED') {
		return 'COMPLETED';
	}

	// Fallback Path: Synchronous Ferrite API evaluation
	try {
		const ferriteClient = getFerriteClient(getToken);
		const service = new OnboardingService(ferriteClient);
		const { currentStep } = await service.getSession();
		return currentStep;
	} catch (error) {
		// Default to the initial step on service failure to preserve gating integrity
		return 'ABOUT_ME';
	}
}
