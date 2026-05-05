import { RequirePermission } from '@common/decorators/require-permission.decorator';
import { PermissionKey } from '@common/schemas/permissions.zodschema';
import type {
	StoreMember,
	StoreRole,
} from '@core/database/schema/store.schema';
import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	UnprocessableEntityException,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateStoreRoleUseCase } from '../../../application/use-cases/create-store-role.usecase';
import { GetRoleMembersUseCase } from '../../../application/use-cases/get-role-members.usecase';
import { GetRolePermissionsUseCase } from '../../../application/use-cases/get-role-permissions.usecase';
import { GetStoreRolesUseCase } from '../../../application/use-cases/get-store-roles.usecase';
import { CreateStoreRoleDto } from '../dto/role.dto';
import { StorePermissionGuard } from '../guards/store-permission.guard';
import {
	CreateStoreRoleDocs,
	GetRoleMembersDocs,
	GetRolePermissionsDocs,
	GetStoreRolesDocs,
} from './docs/role.swaggerdocs';

@ApiTags('Store Roles')
@ApiBearerAuth('swagger-access-token')
@UseGuards(StorePermissionGuard)
@Controller('stores/:storeId/roles')
export class RoleController {
	constructor(
		private readonly createStoreRoleUc: CreateStoreRoleUseCase,
		private readonly getStoreRolesUc: GetStoreRolesUseCase,
		private readonly getRolePermissionsUc: GetRolePermissionsUseCase,
		private readonly getRoleMembersUc: GetRoleMembersUseCase
	) {}

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

	@Get()
	@GetStoreRolesDocs()
	@RequirePermission('staff.read')
	async getRoles(
		@Param('storeId', ParseUUIDPipe) storeId: string
	): Promise<StoreRole[]> {
		const result = await this.getStoreRolesUc.execute(storeId);
		if (result.isErr()) {
			throw new NotFoundException(result.error.message);
		}
		return result.value;
	}

	@Get(':roleId/permissions')
	@GetRolePermissionsDocs()
	@RequirePermission('staff.read')
	async getRolePermissions(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Param('roleId', ParseUUIDPipe) roleId: string
	): Promise<PermissionKey[]> {
		const result = await this.getRolePermissionsUc.execute({ storeId, roleId });
		if (result.isErr()) {
			throw new NotFoundException(result.error.message);
		}
		return result.value;
	}

	@Get(':roleId/members')
	@GetRoleMembersDocs()
	@RequirePermission('staff.read')
	async getRoleMembers(
		@Param('storeId', ParseUUIDPipe) storeId: string,
		@Param('roleId', ParseUUIDPipe) roleId: string
	): Promise<StoreMember[]> {
		const result = await this.getRoleMembersUc.execute({ storeId, roleId });
		if (result.isErr()) {
			throw new NotFoundException(result.error.message);
		}
		return result.value;
	}
}
