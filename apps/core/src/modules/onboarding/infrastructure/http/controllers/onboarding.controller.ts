import type { AuthUser } from '@auth/domain/schemas/auth-user.zodschema';
import { AuthUserParam } from '@common/decorators/auth-user.decorator';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { InvalidStepTransitionError } from '@modules/onboarding/domain/errors/invalid-step-transition.error';
import { OnboardingAlreadyCompletedError } from '@modules/onboarding/domain/errors/onboarding-already-completed.error';
import {
	GET_ONBOARDING_SESSION_UC,
	type IGetOnboardingSessionUseCase,
	type ISubmitAboutMeUseCase,
	type ISubmitStoreCreationUseCase,
	SUBMIT_ABOUT_ME_UC,
	SUBMIT_STORE_CREATION_UC,
} from '@modules/onboarding/domain/ports/use-cases.port';
import {
	Body,
	ConflictException,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubmitAboutMeDto } from '../dto/submit-about-me.dto';
import { SubmitStoreCreationDto } from '../dto/submit-store-creation.dto';

import {
	GetOnboardingSessionDocs,
	SubmitAboutMeDocs,
	SubmitStoreCreationDocs,
} from './docs/onboarding.swaggerdocs';

@ApiTags('Onboarding')
@ApiBearerAuth('swagger-access-token')
@Controller('onboarding')
export class OnboardingController {
	constructor(
		@Inject(GET_ONBOARDING_SESSION_UC)
		private readonly getSessionUc: IGetOnboardingSessionUseCase,

		@Inject(SUBMIT_ABOUT_ME_UC)
		private readonly submitAboutMeUc: ISubmitAboutMeUseCase,

		@Inject(SUBMIT_STORE_CREATION_UC)
		private readonly submitStoreCreationUc: ISubmitStoreCreationUseCase,

		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	@Get('session')
	@GetOnboardingSessionDocs()
	async getSession(@AuthUserParam() authUser: AuthUser) {
		return this.tracer.withSpan('http.get-onboarding-session', async () => {
			const result = await this.getSessionUc.execute(authUser);
			if (result.isErr()) {
				throw result.error;
			}
			return result.value;
		});
	}

	@Post('steps/about-me')
	@HttpCode(HttpStatus.OK)
	@SubmitAboutMeDocs()
	async submitAboutMe(
		@AuthUserParam() authUser: AuthUser,
		@Body() payload: SubmitAboutMeDto
	) {
		return this.tracer.withSpan('http.submit-about-me', async () => {
			const result = await this.submitAboutMeUc.execute({
				authUser,
				data: payload,
			});

			if (result.isErr()) {
				if (
					result.error instanceof InvalidStepTransitionError ||
					result.error instanceof OnboardingAlreadyCompletedError
				) {
					throw new ConflictException(result.error.message);
				}
				throw result.error;
			}

			return result.value;
		});
	}

	@Post('steps/store-creation')
	@HttpCode(HttpStatus.OK)
	@SubmitStoreCreationDocs()
	async submitStoreCreation(
		@AuthUserParam() authUser: AuthUser,
		@Body() payload: SubmitStoreCreationDto
	) {
		return this.tracer.withSpan('http.submit-store-creation', async () => {
			const result = await this.submitStoreCreationUc.execute({
				authUser,
				data: payload,
			});
			if (result.isErr()) {
				if (
					result.error instanceof InvalidStepTransitionError ||
					result.error instanceof OnboardingAlreadyCompletedError
				) {
					throw new ConflictException(result.error.message);
				}
				throw result.error;
			}

			return result.value;
		});
	}
}
