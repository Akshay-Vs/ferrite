import { AuthGuard, type AuthUser, AuthUserParam } from '@auth/index';
import { type ITracer, OTEL_TRACER } from '@core/tracer';

import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Patch,
	UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
	GET_OWN_PROFILE_UC,
	GET_USER_PROFILE_UC,
	type IGetOwnProfileUseCase,
	type IGetUserProfileUseCase,
	type IUpdateOwnProfileUseCase,
	UPDATE_OWN_PROFILE_UC,
} from '@users/domain/ports/use-cases.port';

import { UpdateProfileInputDTO } from '@users/domain/schemas';

import {
	GetOwnProfileDocs,
	GetUserProfileByIdDocs,
	UpdateOwnProfileDocs,
} from './user.swaggerdocs';

@ApiTags('Users')
@ApiBearerAuth('swagger-access-token')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
	constructor(
		@Inject(GET_USER_PROFILE_UC)
		private readonly getUserProfileUseCase: IGetUserProfileUseCase,
		@Inject(GET_OWN_PROFILE_UC)
		private readonly getOwnProfileUseCase: IGetOwnProfileUseCase,
		@Inject(UPDATE_OWN_PROFILE_UC)
		private readonly updateOwnProfileUseCase: IUpdateOwnProfileUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	@Get('me')
	@GetOwnProfileDocs()
	async getOwnProfile(@AuthUserParam() authUser: AuthUser) {
		return this.tracer.withSpan('http.get-own-profile', async () => {
			const result = await this.getOwnProfileUseCase.execute(authUser);
			if (result.isErr()) {
				throw new NotFoundException(result.error.message);
			}
			return result.value;
		});
	}

	@Patch('me')
	@HttpCode(HttpStatus.OK)
	@UpdateOwnProfileDocs()
	async updateOwnProfile(
		@AuthUserParam() authUser: AuthUser,
		@Body() payload: UpdateProfileInputDTO
	) {
		return this.tracer.withSpan('http.update-own-profile', async () => {
			const result = await this.updateOwnProfileUseCase.execute({
				authUser,
				data: payload,
			});
			if (result.isErr()) {
				throw new NotFoundException(result.error.message);
			}
			return { updated: true };
		});
	}

	@Get(':id')
	@GetUserProfileByIdDocs()
	async getUserProfileById(@Param('id', ParseUUIDPipe) id: string) {
		return this.tracer.withSpan('http.get-user-profile-by-id', async () => {
			const result = await this.getUserProfileUseCase.execute(id);
			if (result.isErr()) {
				throw new NotFoundException(result.error.message);
			}
			return result.value;
		});
	}
}
