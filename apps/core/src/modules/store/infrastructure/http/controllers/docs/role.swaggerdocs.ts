import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateStoreRoleDto } from '../../dto/role.dto';

export const CreateStoreRoleDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Create a new store role',
			description:
				'Creates a custom role for a store and assigns the specified permissions. Requires staff.create permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiBody({ type: CreateStoreRoleDto }),
		ApiResponse({ status: 201, description: 'Role created successfully.' }),
		ApiResponse({
			status: 422,
			description: 'Unprocessable entity (validation failed).',
		}),
		ApiResponse({ status: 404, description: 'Store not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const GetStoreRolesDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get all store roles',
			description:
				'Returns a list of all roles within the specified store. Requires staff.read permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiResponse({ status: 200, description: 'Returns a list of roles.' }),
		ApiResponse({ status: 404, description: 'Store not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const GetRolePermissionsDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get role permissions',
			description:
				'Returns a list of permissions assigned to the specified role. Requires staff.read permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiParam({ name: 'roleId', description: 'The UUID of the role.' }),
		ApiResponse({ status: 200, description: 'Returns a list of permissions.' }),
		ApiResponse({ status: 404, description: 'Role not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const GetRoleMembersDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get role members',
			description:
				'Returns a list of members assigned to the specified role. Requires staff.read permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiParam({ name: 'roleId', description: 'The UUID of the role.' }),
		ApiResponse({ status: 200, description: 'Returns a list of members.' }),
		ApiResponse({ status: 404, description: 'Role not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);
