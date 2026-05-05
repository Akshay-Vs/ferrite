import { RequirePermission } from '@common/decorators/require-permission.decorator';
import type { StoreRole } from '@core/database/schema/store.schema';
import {
	Body,
	Controller,
	Param,
	ParseUUIDPipe,
	Post,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateStoreRoleUseCase } from '../../../application/use-cases/create-store-role.usecase';
import { CreateStoreRoleDto } from '../dto/role.dto';
import { StorePermissionGuard } from '../guards/store-permission.guard';
import { CreateStoreRoleDocs } from './docs/role.swaggerdocs';

@ApiTags('Store Roles')
@ApiBearerAuth('swagger-access-token')
@UseGuards(StorePermissionGuard)
@Controller('stores/:storeId/roles')
export class RoleController {
	constructor(private readonly createStoreRoleUc: CreateStoreRoleUseCase) {}

	@Post()
	@CreateStoreRoleDocs()
	@RequirePermission('staff.create')
	async createRole(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Body() payload: CreateStoreRoleDto
	): Promise<StoreRole> {
		const result = await this.createStoreRoleUc.execute({
			storeId,
			name: payload.name,
			description: payload.description ?? null,
			isSystem: false,
			permissions: payload.permissions,
		});

		if (result.isErr()) {
			throw new UnprocessableEntityException(result.error.message);
		}

		return result.value;
	}
}
