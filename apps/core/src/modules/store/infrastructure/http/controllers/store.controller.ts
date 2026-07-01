import { randomBytes } from 'node:crypto';
import { AuthUserParam } from '@common/decorators/auth-user.decorator';
import { PublicRoute } from '@common/decorators/public-route.decorator';
import { RequirePermission } from '@common/decorators/require-permission.decorator';
import { SkipPermissions } from '@common/decorators/skip-permissions.decorator';
import type { Store } from '@core/database/schema/store.schema';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import type { AuthUser } from '@ferrite/schema/auth/auth-user.zodschema';
import type {
	GetStore,
	ListOwnStores,
} from '@ferrite/schema/stores/get-store.zodschema';
import { RoleNotFoundError } from '@modules/store/domain/errors/role-not-found.error';
import { SystemRoleProtectedError } from '@modules/store/domain/errors/system-role-protected.error';
import {
	type IInviteStoreMemberUseCase,
	INVITE_STORE_MEMBER_UC,
} from '@modules/store/domain/ports/member-use-cases.port';
import {
	DELETE_STORE_UC,
	GET_OWN_STORES_UC,
	GET_PUBLIC_STORE_UC,
	type IDeleteStoreUseCase,
	type IGetPublicStoreUseCase,
	type IGetStoresUseCase,
	type IInitializeStoreOrchestratorUseCase,
	INITIALIZE_STORE_ORCHESTRATOR_UC,
	type IUpdateStoreUseCase,
	UPDATE_STORE_UC,
} from '@modules/store/domain/ports/store-use-cases.port';
import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InviteStoreMemberDto } from '../dto/invite-store-member.dto';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';
import { StorePermissionGuard } from '../guards/store-permission.guard';
import {
	CreateStoreDocs,
	DeleteStoreDocs,
	GetStoreByIdDocs,
	GetStoresDocs,
	InviteStoreMemberDocs,
	UpdateStoreDocs,
} from './docs/store.swaggerdocs';

@ApiTags('Stores')
@ApiBearerAuth('swagger-access-token')
@UseGuards(StorePermissionGuard)
@Controller('stores')
export class StoreController {
	constructor(
		@Inject(INITIALIZE_STORE_ORCHESTRATOR_UC)
		private readonly initializeStoreOrchestratorPc: IInitializeStoreOrchestratorUseCase,
		@Inject(GET_OWN_STORES_UC)
		private readonly getStoresUc: IGetStoresUseCase,
		@Inject(GET_PUBLIC_STORE_UC)
		private readonly getPublicStoreUc: IGetPublicStoreUseCase,
		@Inject(UPDATE_STORE_UC)
		private readonly updateStoreUc: IUpdateStoreUseCase,
		@Inject(DELETE_STORE_UC)
		private readonly deleteStoreUc: IDeleteStoreUseCase,
		@Inject(INVITE_STORE_MEMBER_UC)
		private readonly inviteStoreMemberUc: IInviteStoreMemberUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	@Post()
	@CreateStoreDocs()
	@SkipPermissions()
	async createStore(
		@AuthUserParam() user: AuthUser,
		@Body() payload: CreateStoreDto
	): Promise<GetStore> {
		return this.tracer.withSpan('http.create-store', async () => {
			const result = await this.initializeStoreOrchestratorPc.execute({
				input: payload,
				createdBy: user.id,
			});

			if (result.isErr()) {
				throw new UnprocessableEntityException('Failed to create store');
			}

			const store = result.value;
			return {
				id: store.id,
				name: store.name,
				slug: store.slug,
				currencyCode: store.currencyCode,
				isActive: store.isActive,
				description: store.description ?? undefined,
				storeIcon: store.icon ?? undefined,
				bannerUrl: store.bannerUrl ?? undefined,
			};
		});
	}

	@Get()
	@GetStoresDocs()
	@SkipPermissions()
	async getOwnStores(
		@AuthUserParam() user: AuthUser,
		@Query('cursor') cursor?: string,
		@Query('limit') limit?: string
	): Promise<ListOwnStores> {
		return this.tracer.withSpan('http.get-own-stores', async () => {
			const result = await this.getStoresUc.execute({
				userId: user.id,
				cursor,
				limit: limit ? parseInt(limit, 10) : undefined,
			});
			if (result.isErr()) {
				throw new UnprocessableEntityException('Failed to get stores');
			}
			return result.value;
		});
	}

	@Get(':storeId')
	@GetStoreByIdDocs()
	@PublicRoute()
	async getStoreById(
		@Param('storeId', ParseUUIDPipe) storeId: string
	): Promise<GetStore> {
		return this.tracer.withSpan('http.get-store-by-id', async () => {
			const result = await this.getPublicStoreUc.execute(storeId);
			if (result.isErr()) {
				throw new NotFoundException('Store not found');
			}
			return result.value;
		});
	}

	@Patch(':storeId')
	@UpdateStoreDocs()
	@RequirePermission('store.update')
	async updateStore(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: UpdateStoreDto
	): Promise<Store> {
		return this.tracer.withSpan('http.update-store', async () => {
			const result = await this.updateStoreUc.execute({
				storeId,
				data: payload,
			});
			if (result.isErr()) {
				throw new NotFoundException('Store not found');
			}
			return result.value;
		});
	}

	@Delete(':storeId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@DeleteStoreDocs()
	@RequirePermission('store.delete')
	async deleteStore(
		@Param('storeId', ParseUUIDPipe) storeId: string
	): Promise<void> {
		return this.tracer.withSpan('http.delete-store', async () => {
			const result = await this.deleteStoreUc.execute(storeId);
			if (result.isErr()) {
				throw new NotFoundException('Store not found');
			}
		});
	}

	@Post(':storeId/invites')
	@HttpCode(HttpStatus.CREATED)
	@InviteStoreMemberDocs()
	@RequirePermission('staff.create')
	async inviteMember(
		@AuthUserParam() user: AuthUser,
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: InviteStoreMemberDto
	): Promise<void> {
		return this.tracer.withSpan('http.invite-store-member', async () => {
			const token = randomBytes(32).toString('hex');
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

			const result = await this.inviteStoreMemberUc.execute({
				storeId,
				email: payload.email,
				roleId: payload.roleId,
				invitedBy: user.id,
				token,
				expiresAt,
			});
			if (result.isErr()) {
				if (result.error instanceof RoleNotFoundError) {
					throw new NotFoundException('Role not found');
				}

				if (result.error instanceof SystemRoleProtectedError) {
					throw new BadRequestException('Cannot assign protected role');
				}

				throw new UnprocessableEntityException('Failed to invite member');
			}
		});
	}
}
