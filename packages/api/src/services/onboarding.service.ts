import type {
	OnboardingAboutUser,
	OnboardingStorePayload,
} from '@ferrite/schema';
import {
	type OnboardingSession,
	onboardingSessionSchema,
} from '@ferrite/schema/onboarding/onboarding-session.zodschema';
import type { FerriteClient } from '../client';

export class OnboardingService {
	private readonly domain = 'onboarding';

	constructor(private readonly client: FerriteClient) {}

	/**
	 * Get the current onboarding session state
	 */
	public async getSession(): Promise<OnboardingSession> {
		return this.client.get(`${this.domain}/session`, onboardingSessionSchema);
	}

	/**
	 * Update user data for the onboarding
	 */
	public async onboardUser(
		payload: OnboardingAboutUser
	): Promise<OnboardingSession> {
		return this.client.post(
			`${this.domain}/steps/about-me`,
			onboardingSessionSchema,
			payload
		);
	}

	/**
	 * Create first store for the user
	 */
	public async onboardStore(
		payload: OnboardingStorePayload
	): Promise<OnboardingSession> {
		return this.client.post(
			`${this.domain}/steps/store-creation`,
			onboardingSessionSchema,
			payload
		);
	}
}
