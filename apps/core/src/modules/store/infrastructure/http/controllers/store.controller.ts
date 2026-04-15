import type { AuthUser } from '@auth/domain/schemas/auth-user.zodschema';
import { AuthUserParam } from '@common/decorators/auth-user.decorator';
import { PublicRoute } from '@common/decorators/public-route.decorator';
import { RequirePermission } from '@common/decorators/require-permission.decorator';
import type { Store } from '@core/database/schema/store.schema';
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DeleteStoreUseCase } from '../../../application/use-cases/delete-store.usecase';
import { GetOwnStoresUseCase } from '../../../application/use-cases/get-own-stores.usecase';
import {
	GetPublicStoreUseCase,
	type PublicStoreDto,
} from '../../../application/use-cases/get-public-store.usecase';
import { InitializeStoreOrchestratorUseCase } from '../../../application/use-cases/initialize-store-orchestrator.usecase';
import { UpdateStoreUseCase } from '../../../application/use-cases/update-store.usecase';
import { CreateStoreDto, UpdateStoreDto } from '../dto/store.dto';
import { StorePermissionGuard } from '../guards/store-permission.guard';

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
		private readonly deleteStoreUc: DeleteStoreUseCase
	) {}

	@Post()
	@ApiBearerAuth()
	async createStore(
		@AuthUserParam() user: AuthUser,
		@Body() payload: CreateStoreDto
	): Promise<Store> {
		const result = await this.initializeStoreOrchestratorPc.execute({
			input: payload,
			createdBy: user.id,
		});

		if (result.isErr()) {
			throw new UnprocessableEntityException(result.error.message);
		}
		return result.value;
	}

	@Get()
	@ApiBearerAuth()
	async getOwnStores(@AuthUserParam() user: AuthUser): Promise<Store[]> {
		const result = await this.getOwnStoresUc.execute(user.id);
		if (result.isErr()) {
			throw new UnprocessableEntityException(result.error.message);
		}
		return result.value;
	}

	@Get(':storeId')
	@PublicRoute()
	async getStoreById(
		@Param('storeId', ParseUUIDPipe) storeId: string
	): Promise<PublicStoreDto> {
		const result = await this.getPublicStoreUc.execute(storeId);
		if (result.isErr()) {
			throw new NotFoundException(result.error.message);
		}
		return result.value;
	}

	@Patch(':storeId')
	@ApiBearerAuth()
	@RequirePermission('store.write')
	async updateStore(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: UpdateStoreDto
	): Promise<Store> {
		const result = await this.updateStoreUc.execute({
			storeId,
			data: payload,
		});
		if (result.isErr()) {
			throw new NotFoundException(result.error.message);
		}
		return result.value;
	}

	@Delete(':storeId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBearerAuth()
	@RequirePermission('store.delete')
	async deleteStore(
		@Param('storeId', ParseUUIDPipe) storeId: string
	): Promise<void> {
		const result = await this.deleteStoreUc.execute(storeId);
		if (result.isErr()) {
			throw new NotFoundException(result.error.message);
		}
	}
}
