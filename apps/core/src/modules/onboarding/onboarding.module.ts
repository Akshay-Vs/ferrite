import { StoreModule } from '@modules/store';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { GetOnboardingSessionUseCase } from './application/use-cases/get-onboarding-session.usecase';
import { SubmitAboutMeUseCase } from './application/use-cases/submit-about-me.usecase';
import { SubmitStoreCreationUseCase } from './application/use-cases/submit-store-creation.usecase';
import { ONBOARDING_REPOSITORY } from './domain/ports/onboarding-repository.port';
import { STORE_DELEGATE } from './domain/ports/store-delegate.port';
import {
	GET_ONBOARDING_SESSION_UC,
	SUBMIT_ABOUT_ME_UC,
	SUBMIT_STORE_CREATION_UC,
} from './domain/ports/use-cases.port';
import { USER_DELEGATE } from './domain/ports/user-delegate.port';
import { StoreDelegateAdapter } from './infrastructure/delegates/store-delegate.adapter';
import { UserDelegateAdapter } from './infrastructure/delegates/user-delegate.adapter';
import { OnboardingController } from './infrastructure/http/controllers/onboarding.controller';
import { DrizzleOnboardingRepository } from './infrastructure/persistance/repositories/drizzle-onboarding.repository';

@Module({
	imports: [UsersModule, StoreModule],
	controllers: [OnboardingController],
	providers: [
		// Repository
		{
			provide: ONBOARDING_REPOSITORY,
			useClass: DrizzleOnboardingRepository,
		},

		// Delegation adapters
		{
			provide: USER_DELEGATE,
			useClass: UserDelegateAdapter,
		},
		{
			provide: STORE_DELEGATE,
			useClass: StoreDelegateAdapter,
		},

		// Use cases
		{
			provide: GET_ONBOARDING_SESSION_UC,
			useClass: GetOnboardingSessionUseCase,
		},
		{
			provide: SUBMIT_ABOUT_ME_UC,
			useClass: SubmitAboutMeUseCase,
		},
		{
			provide: SUBMIT_STORE_CREATION_UC,
			useClass: SubmitStoreCreationUseCase,
		},
	],
})
export class OnboardingModule {}
