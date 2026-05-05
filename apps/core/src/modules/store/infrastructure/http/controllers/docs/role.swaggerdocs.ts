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
