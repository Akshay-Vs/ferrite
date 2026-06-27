import { PublicRoute } from '@common/decorators/public-route.decorator';
import { AuthStep } from '@ferrite/schema/storefront-auth/auth-step';
import { IncompleteConfigurationError } from '@modules/store';
import { EmailAlreadyRegisteredError } from '@modules/storefront-auth/domain/errors/email-already-registered.error';
import { RateLimitedError } from '@modules/storefront-auth/domain/errors/rate-limited.error';
import {
	type IResendVerificationEmail,
	type IVerifyEmail,
	STOREFRONT_RESEND_VERIFICATION_EMAIL_UC,
	STOREFRONT_VERIFY_EMAIL_UC,
} from '@modules/storefront-auth/domain/ports/email-verification-usecase.port';
import { STOREFRONT_LOGIN_UC } from '@modules/storefront-auth/domain/ports/login-usecase.port';
import type { IStorefrontRegisterUser } from '@modules/storefront-auth/domain/ports/register-usecase.port';
import { STOREFRONT_REGISTER_UC } from '@modules/storefront-auth/domain/ports/register-usecase.port';
import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	InternalServerErrorException,
	NotImplementedException,
	Param,
	ParseUUIDPipe,
	Post,
	UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	LoginUserDocs,
	RegisterUserDocs,
	ResendVerificationEmailDocs,
	VerifyEmailDocs,
} from '../docs/storefront-auth.docs';
import { LoginInputDTO } from '../dto/login.dto';
import { RegisterInputDTO } from '../dto/register.dto';
import { ResendVerificationEmailDTO } from '../dto/resend-verification-email.dto';
import { VerifyEmailDTO } from '../dto/verify-email.dto';

@ApiTags('Storefront Auth')
@Controller(':storeId/storefront-auth')
export class StorefrontAuthController {
	constructor(
		@Inject(STOREFRONT_LOGIN_UC)
		@Inject(STOREFRONT_REGISTER_UC)
		private readonly registerUseCase: IStorefrontRegisterUser,
		@Inject(STOREFRONT_VERIFY_EMAIL_UC)
		private readonly verifyEmailUseCase: IVerifyEmail,
		@Inject(STOREFRONT_RESEND_VERIFICATION_EMAIL_UC)
		private readonly resendVerificationEmailUC: IResendVerificationEmail
	) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@LoginUserDocs()
	@PublicRoute()
	async login(
		@Param('storeId', ParseUUIDPipe) _storeId: string,
		@Body() _payload: LoginInputDTO
	) {
		throw new NotImplementedException(
			'Login functionality is not implemented yet.'
		);
	}

	@Post('register')
	@RegisterUserDocs()
	@PublicRoute()
	async register(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: RegisterInputDTO
	) {
		const result = await this.registerUseCase.execute({
			...payload,
			storeId,
		});

		if (result.isErr()) {
			if (result.error instanceof IncompleteConfigurationError) {
				throw new InternalServerErrorException({
					message: result.error.message,
					error: 'Internal Server Error',
					isPublic: true,
				});
			}
			if (result.error instanceof EmailAlreadyRegisteredError) {
				throw new ConflictException(result.error.message);
			}
			throw new UnprocessableEntityException(result.error.message);
		}

		return {
			step: AuthStep.EMAIL_VERIFICATION_REQUIRED,
			user: result.value,
		};
	}

	@Post('verify-email')
	@HttpCode(HttpStatus.OK)
	@VerifyEmailDocs()
	@PublicRoute()
	async verifyEmail(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: VerifyEmailDTO
	) {
		const result = await this.verifyEmailUseCase.execute({
			storeId,
			userId: payload.userId,
			token: payload.token,
		});

		if (result.isErr()) {
			if (result.error instanceof RateLimitedError) {
				throw result.error;
			}
			if (result.error instanceof IncompleteConfigurationError) {
				throw new InternalServerErrorException({
					message: result.error.message,
					error: 'Internal Server Error',
					isPublic: true,
				});
			}
			throw new UnprocessableEntityException(result.error.message);
		}

		return { step: AuthStep.EMAIL_VERIFIED };
	}

	@Post('resend-verification-email')
	@HttpCode(HttpStatus.OK)
	@ResendVerificationEmailDocs()
	@PublicRoute()
	async resendVerificationEmail(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: ResendVerificationEmailDTO
	) {
		const result = await this.resendVerificationEmailUC.execute({
			storeId,
			userId: payload.userId,
			email: payload.email,
		});

		if (result.isErr()) {
			if (result.error instanceof RateLimitedError) {
				throw result.error;
			}
			if (result.error instanceof IncompleteConfigurationError) {
				throw new InternalServerErrorException({
					message: result.error.message,
					error: 'Internal Server Error',
					isPublic: true,
				});
			}
			throw new UnprocessableEntityException(result.error.message);
		}

		return { step: AuthStep.EMAIL_VERIFICATION_REQUIRED };
	}
}
