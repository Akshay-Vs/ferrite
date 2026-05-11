import type { UserOnboarding } from '@core/database/schema/onboarding.schema';
import {
	type OnboardingSession,
	onboardingSessionSchema,
} from '@ferrite/schema/onboarding/onboarding-session.zodschema';

/**
 * Maps Drizzle ORM rows ↔ Domain types for the onboarding module.
 */
export class OnboardingMapper {
	static toDomain(row: UserOnboarding): OnboardingSession {
		return onboardingSessionSchema.parse({
			userId: row.userId,
			currentStep: row.state,
			isCompleted: row.isCompleted,
			stepData: row.stepData ?? undefined,
		});
	}
}
