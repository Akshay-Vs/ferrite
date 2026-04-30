import type { UserOnboarding } from '@core/database/schema/onboarding.schema';
import { OnboardingSession } from '@modules/onboarding/domain/schemas/onboarding-state.zodschema';

/**
 * Maps Drizzle ORM rows ↔ Domain types for the onboarding module.
 */
export class OnboardingMapper {
	static toDomain(row: UserOnboarding): OnboardingSession {
		return {
			userId: row.userId,
			currentStep: row.state as OnboardingSession['currentStep'],
			isCompleted: row.isCompleted,
			stepData: (row.stepData as Record<string, unknown>) ?? undefined,
		};
	}
}
