import type { AuthUser } from '@auth/domain/schemas/auth-user.zodschema';
import { err, ok, type Result } from '@common/interfaces/result.interface';
import {
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import type { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { InvalidStepTransitionError } from '../../domain/errors/invalid-step-transition.error';
import { OnboardingAlreadyCompletedError } from '../../domain/errors/onboarding-already-completed.error';
import {
	type IOnboardingRepository,
	ONBOARDING_REPOSITORY,
} from '../../domain/ports/onboarding-repository.port';
import {
	type IUserDelegate,
	USER_DELEGATE,
} from '../../domain/ports/user-delegate.port';
import type { OnboardingSession } from '../../domain/schemas/onboarding-state.zodschema';
import type { SubmitAboutMeInput } from '../../domain/schemas/submit-about-me.zodschema';

@Injectable()
export class SubmitAboutMeUseCase
	implements
		IUseCase<
			{ authUser: AuthUser; data: SubmitAboutMeInput },
			OnboardingSession,
			InvalidStepTransitionError | OnboardingAlreadyCompletedError | Error
		>
{
	constructor(
		@Inject(ONBOARDING_REPOSITORY)
		private readonly onboardingRepo: IOnboardingRepository,
		@Inject(USER_DELEGATE)
		private readonly userDelegate: IUserDelegate,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		authUser: AuthUser;
		data: SubmitAboutMeInput;
	}): Promise<
		Result<
			OnboardingSession,
			InvalidStepTransitionError | OnboardingAlreadyCompletedError | Error
		>
	> {
		return this.tracer.withSpan(
			'use-case.submit-about-me',
			async () => {
				const userId = input.authUser.id;

				// 1. Fetch current state
				const session = await this.onboardingRepo.findByUserId(userId);
				if (!session) {
					return err(new Error(`No onboarding session for user ${userId}`));
				}

				// 2. Guard: already completed
				if (session.isCompleted) {
					return err(new OnboardingAlreadyCompletedError(userId));
				}

				// 3. Guard: must be at ABOUT_ME step
				if (session.currentStep !== 'ABOUT_ME') {
					return err(
						new InvalidStepTransitionError(session.currentStep, 'ABOUT_ME')
					);
				}

				// 4. Atomic: update profile + enqueue sync event + advance state
				await this.uow.execute(async (tx) => {
					await this.userDelegate.updateProfile(
						userId,
						input.data,
						input.authUser.externalAuthId,
						input.authUser.provider,
						tx
					);
					await this.onboardingRepo.updateState(userId, 'STORE_CREATION', tx);
				});

				this.logger.log(`About Me step completed for user ${userId}`);

				// 5. Return updated session
				const updatedSession = await this.onboardingRepo.findByUserId(userId);

				return ok(updatedSession!);
			},
			{ 'use-case.userId': input.authUser.id }
		);
	}
}
