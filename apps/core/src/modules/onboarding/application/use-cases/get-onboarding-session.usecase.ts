import { err, ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { AuthUser } from '@ferrite/schema/auth/auth-user.zodschema';
import type { OnboardingSession } from '@ferrite/schema/onboarding/onboarding-session.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IOnboardingRepository,
	ONBOARDING_REPOSITORY,
} from '../../domain/ports/onboarding-repository.port';

@Injectable()
export class GetOnboardingSessionUseCase
	implements IUseCase<AuthUser, OnboardingSession, Error>
{
	constructor(
		@Inject(ONBOARDING_REPOSITORY)
		private readonly onboardingRepo: IOnboardingRepository,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(authUser: AuthUser): Promise<Result<OnboardingSession, Error>> {
		return this.tracer.withSpan('use-case.get-onboarding-session', async () => {
			const userId = authUser.id;

			try {
				// Try to find existing session
				let session = await this.onboardingRepo.findByUserId(userId);

				if (!session) {
					// Lazy initialization — idempotent upsert
					this.logger.debug(`Creating onboarding session for user ${userId}`);
					session = await this.onboardingRepo.upsert(userId);
				}

				return ok(session);
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error);
				const errorStack = error instanceof Error ? error.stack : undefined;
				this.logger.error(
					`Failed to get or create onboarding session: ${errorMsg}`,
					errorStack,
					'GetOnboardingSessionUseCase'
				);
				return err(error instanceof Error ? error : new Error(errorMsg));
			}
		});
	}
}
