import type { AuthUser } from '@auth/domain/schemas/auth-user.zodschema';
import { ok, type Result } from '@common/interfaces/result.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import {
	type IOnboardingRepository,
	ONBOARDING_REPOSITORY,
} from '../../domain/ports/onboarding-repository.port';
import type { OnboardingSession } from '../../domain/schemas/onboarding-state.zodschema';

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

import { err, ok, type Result } from '@common/interfaces/result.interface';
// ... other imports ...

	async execute(authUser: AuthUser): Promise<Result<OnboardingSession, Error>> {
		return this.tracer.withSpan(
			'use-case.get-onboarding-session',
			async () => {
				try {
					const userId = authUser.id;
					let session = await this.onboardingRepo.findByUserId(userId);

					if (!session) {
						this.logger.log('Creating onboarding session');
						session = await this.onboardingRepo.upsert(userId);
					}

					return ok(session);
				} catch (cause) {
					return err(
						cause instanceof Error
							? cause
							: new Error('Failed to get onboarding session')
					);
				}
			},
			{ 'use-case.userId': authUser.id }
		);
	}
	}
}
