import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OnboardingAboutUserDto } from '../../dto/submit-about-me.dto';
import { OnboardingStoreCreationDto } from '../../dto/submit-store-creation.dto';

export const GetOnboardingSessionDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get onboarding session',
			description:
				'Returns the current onboarding state for the authenticated user. Creates a session if none exists (idempotent).',
		}),
		ApiResponse({
			status: 200,
			description: 'Returns the current onboarding session.',
		}),
		ApiResponse({
			status: 404,
			description: 'User not yet synced to the database (UserNotSyncedError).',
		}),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const SubmitAboutMeDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Submit "About Me" step',
			description:
				'Updates the user profile and advances onboarding to the STORE_CREATION step. Atomic transaction.',
		}),
		ApiBody({ type: OnboardingAboutUserDto }),
		ApiResponse({
			status: 200,
			description: 'About Me step submitted successfully.',
		}),
		ApiResponse({
			status: 409,
			description:
				'Conflict (InvalidStepTransitionError or OnboardingAlreadyCompletedError).',
		}),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const SubmitStoreCreationDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Submit "Store Creation" step',
			description:
				'Creates a store with owner role and completes onboarding. Atomic transaction.',
		}),
		ApiBody({ type: OnboardingStoreCreationDto }),
		ApiResponse({
			status: 200,
			description: 'Store created and onboarding completed successfully.',
		}),
		ApiResponse({
			status: 409,
			description:
				'Conflict (InvalidStepTransitionError or OnboardingAlreadyCompletedError).',
		}),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);
