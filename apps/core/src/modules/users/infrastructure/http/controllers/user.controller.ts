import { type AuthUser } from '@auth/index';
import { AuthUserParam } from '@common/decorators/auth-user.decorator';
import { RequireRole } from '@common/decorators/require-role.decorator';
import { PlatformRoles } from '@common/schemas/platform-roles.zodschema';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
	Param,
	Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
	GET_ALL_USERS_UC,
	GET_OWN_PROFILE_UC,
	GET_USER_BY_ID_UC,
	type IGetAllUsersUseCase,
	type IGetOwnProfileUseCase,
	type IGetUserByIdUseCase,
	type IInitiateDeleteUserUseCase,
	type IInitiateProfileUpdateUseCase,
	type IInitiateRoleUpdateUseCase,
	INITIATE_DELETE_USER_UC,
	INITIATE_PROFILE_UPDATE_UC,
	INITIATE_ROLE_UPDATE_UC,
} from '@users/domain/ports/use-cases.port';
import { UpdateProfileInputDTO } from '../dto/update-profile.dto';
import { UpdateRoleInputDTO } from '../dto/update-role.dto';
import {
	DeleteOwnProfileDocs,
	GetAllUsersDocs,
	GetOwnProfileDocs,
	GetUserByIdDocs,
	UpdateOwnProfileDocs,
	UpdateUserRoleDocs,
} from './docs/user.swaggerdocs';

const ME_ROUTE = 'me';

@ApiTags('Users')
@ApiBearerAuth('swagger-access-token')
@Controller('users')
export class UserController {
	constructor(
		@Inject(GET_OWN_PROFILE_UC)
		private readonly getOwnProfileUseCase: IGetOwnProfileUseCase,

		@Inject(INITIATE_PROFILE_UPDATE_UC)
		private readonly updateOwnProfileUseCase: IInitiateProfileUpdateUseCase,

		@Inject(INITIATE_DELETE_USER_UC)
		private readonly InitiatedeleteUserUseCase: IInitiateDeleteUserUseCase,

		@Inject(INITIATE_ROLE_UPDATE_UC)
		private readonly updateRoleUseCase: IInitiateRoleUpdateUseCase,

		@Inject(GET_ALL_USERS_UC)
		private readonly getAllUsersUseCase: IGetAllUsersUseCase,

		@Inject(GET_USER_BY_ID_UC)
		private readonly getUserByIdUseCase: IGetUserByIdUseCase,

		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	@Get(ME_ROUTE)
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

	@Patch(ME_ROUTE)
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
			return result.value;
		});
	}

	@Delete(ME_ROUTE)
	@HttpCode(HttpStatus.OK)
	@DeleteOwnProfileDocs()
	async deleteOwnProfile(@AuthUserParam() authUser: AuthUser) {
		return this.tracer.withSpan('http.delete-own-profile', async () => {
			const result = await this.InitiatedeleteUserUseCase.execute(authUser);
			if (result.isErr()) {
				throw new NotFoundException(result.error.message);
			}
			return result.value;
		});
	}

	// Privileged Admin Routes

	@Get()
	@RequireRole(PlatformRoles.STAFF)
	@GetAllUsersDocs()
	async getAllUsers() {
		return this.tracer.withSpan('http.get-all-users', async () => {
			const result = await this.getAllUsersUseCase.execute();
			return result.value;
		});
	}

	@Get(':id')
	@RequireRole(PlatformRoles.STAFF)
	@GetUserByIdDocs()
	async getUserById(@Param('id') id: string) {
		return this.tracer.withSpan('http.get-user-by-id', async () => {
			const result = await this.getUserByIdUseCase.execute(id);
			if (result.isErr()) {
				throw new NotFoundException(result.error.message);
			}
			return result.value;
		});
	}

	@Patch(':id/role')
	@HttpCode(HttpStatus.OK)
	@RequireRole(PlatformRoles.ADMIN)
	@UpdateUserRoleDocs()
	async updateUserRole(
		@Param('id') id: string,
		@Body() payload: UpdateRoleInputDTO
	) {
		return this.tracer.withSpan('http.update-user-role', async () => {
			const result = await this.updateRoleUseCase.execute({
				userId: id,
				data: payload,
			});
			if (result.isErr()) {
				throw new NotFoundException(result.error.message);
			}
			return result.value;
		});
	}
}
