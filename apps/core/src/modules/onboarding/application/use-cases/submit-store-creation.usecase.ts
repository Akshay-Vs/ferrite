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
	type IStoreDelegate,
	STORE_DELEGATE,
} from '../../domain/ports/store-delegate.port';
import type { OnboardingSession } from '../../domain/schemas/onboarding-state.zodschema';
import type { SubmitStoreCreationInput } from '../../domain/schemas/submit-store-creation.zodschema';

@Injectable()
export class SubmitStoreCreationUseCase
	implements
		IUseCase<
			{ authUser: AuthUser; data: SubmitStoreCreationInput },
			OnboardingSession,
			InvalidStepTransitionError | OnboardingAlreadyCompletedError | Error
		>
{
	constructor(
		@Inject(ONBOARDING_REPOSITORY)
		private readonly onboardingRepo: IOnboardingRepository,
		@Inject(STORE_DELEGATE)
		private readonly storeDelegate: IStoreDelegate,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(input: {
		authUser: AuthUser;
		data: SubmitStoreCreationInput;
	}): Promise<
		Result<
			OnboardingSession,
			InvalidStepTransitionError | OnboardingAlreadyCompletedError | Error
		>
	> {
		return this.tracer.withSpan(
			'use-case.submit-store-creation',
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

				// 3. Guard: must be at STORE_CREATION step
				if (session.currentStep !== 'STORE_CREATION') {
					return err(
						new InvalidStepTransitionError(
							session.currentStep,
							'STORE_CREATION'
						)
					);
				}

				// 4. Atomic: create store + role + member + complete onboarding
				await this.uow.execute(async (tx) => {
					await this.storeDelegate.createStoreWithOwner(input.data, userId, tx);
					await this.onboardingRepo.updateState(userId, 'COMPLETED', tx);
					await this.onboardingRepo.markCompleted(userId, tx);
				});

				this.logger.log(
					`Store creation step completed for user ${userId}, onboarding finished`
				);

				// 5. Return completed session
				const completedSession = await this.onboardingRepo.findByUserId(userId);

				return ok(completedSession!);
			},
			{ 'use-case.userId': input.authUser.id }
		);
	}
}
