import { AuthUserParam } from '@common/decorators/auth-user.decorator';
import { PublicRoute } from '@common/decorators/public-route.decorator';
import { RequirePermission } from '@common/decorators/require-permission.decorator';
import { SkipPermissions } from '@common/decorators/skip-permissions.decorator';
import type { Store } from '@core/database/schema/store.schema';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import type { AuthUser } from '@ferrite/schema/auth/auth-user.zodschema';
import type {
	GetAllStores,
	GetStore,
} from '@ferrite/schema/stores/get-store.zodschema';
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
	ParseUUIDPipe,
	Patch,
	Post,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddStoreMembersUseCase } from '../../../application/use-cases/add-store-members.usecase';
import { DeleteStoreUseCase } from '../../../application/use-cases/delete-store.usecase';
import { GetOwnStoresUseCase } from '../../../application/use-cases/get-own-stores.usecase';
import { GetPublicStoreUseCase } from '../../../application/use-cases/get-public-store.usecase';
import { InitializeStoreOrchestratorUseCase } from '../../../application/use-cases/initialize-store-orchestrator.usecase';
import { UpdateStoreUseCase } from '../../../application/use-cases/update-store.usecase';
import { AddStoreMembersDto } from '../dto/add-store-members.dto';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';
import { StorePermissionGuard } from '../guards/store-permission.guard';
import {
	AddStoreMembersDocs,
	CreateStoreDocs,
	DeleteStoreDocs,
	GetOwnStoresDocs,
	GetStoreByIdDocs,
	UpdateStoreDocs,
} from './docs/store.swaggerdocs';

@ApiTags('Stores')
@ApiBearerAuth('swagger-access-token')
@UseGuards(StorePermissionGuard)
@Controller('stores')
export class StoreController {
	constructor(
		private readonly initializeStoreOrchestratorPc: InitializeStoreOrchestratorUseCase,
		private readonly getOwnStoresUc: GetOwnStoresUseCase,
		private readonly getPublicStoreUc: GetPublicStoreUseCase,
		private readonly updateStoreUc: UpdateStoreUseCase,
		private readonly deleteStoreUc: DeleteStoreUseCase,
		private readonly addStoreMembersUc: AddStoreMembersUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	@Post()
	@CreateStoreDocs()
	@SkipPermissions()
	async createStore(
		@AuthUserParam() user: AuthUser,
		@Body() payload: CreateStoreDto
	): Promise<Store> {
		return this.tracer.withSpan('http.create-store', async () => {
			const result = await this.initializeStoreOrchestratorPc.execute({
				input: payload,
				createdBy: user.id,
			});

			if (result.isErr()) {
				throw new UnprocessableEntityException('Failed to create store');
			}
			return result.value;
		});
	}

	@Get()
	@GetOwnStoresDocs()
	@SkipPermissions()
	async getOwnStores(@AuthUserParam() user: AuthUser): Promise<GetAllStores[]> {
		return this.tracer.withSpan('http.get-own-stores', async () => {
			const result = await this.getOwnStoresUc.execute(user.id);
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
				throw new NotFoundException(result.error.message);
			}
		});
	}

	@Post(':storeId/members')
	@HttpCode(HttpStatus.CREATED)
	@AddStoreMembersDocs()
	@RequirePermission('staff.create')
	async addMembers(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: AddStoreMembersDto
	): Promise<void> {
		return this.tracer.withSpan('http.add-store-members', async () => {
			const result = await this.addStoreMembersUc.execute({
				storeId,
				userIds: payload.userIds,
				roleId: payload.roleId,
			});
			if (result.isErr()) {
				throw new UnprocessableEntityException('Failed to add members');
			}
		});
	}
}
