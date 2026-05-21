import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
	CreateStoreRoleDto,
	UpdateRolePermissionsDto,
} from '../../dto/role.dto';

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

export const DeleteStoreRoleDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Delete a store role',
			description:
				'Deletes a custom store role. Cannot delete system roles or roles with active members. Requires staff.delete permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiParam({ name: 'roleId', description: 'The UUID of the role.' }),
		ApiResponse({ status: 204, description: 'Role deleted successfully.' }),
		ApiResponse({ status: 403, description: 'System role protected.' }),
		ApiResponse({ status: 404, description: 'Role not found.' }),
		ApiResponse({ status: 409, description: 'Role has active members.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const RemoveRoleMemberDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Remove member from store',
			description:
				'Removes a user from a store. Requires staff.delete permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiParam({ name: 'roleId', description: 'The UUID of the role.' }),
		ApiParam({ name: 'userId', description: 'The UUID of the user.' }),
		ApiResponse({ status: 204, description: 'Member removed successfully.' }),
		ApiResponse({ status: 403, description: 'Owner protected.' }),
		ApiResponse({ status: 404, description: 'Member not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const UpdateRolePermissionsDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Update role permissions',
			description:
				'Replaces the permissions for a role. Cannot modify system roles. Requires staff.update permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiParam({ name: 'roleId', description: 'The UUID of the role.' }),
		ApiBody({ type: UpdateRolePermissionsDto }),
		ApiResponse({
			status: 204,
			description: 'Permissions updated successfully.',
		}),
		ApiResponse({ status: 403, description: 'System role protected.' }),
		ApiResponse({ status: 404, description: 'Role not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const SuspendRoleMemberDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Suspend store member',
			description:
				'Temporarily suspends a user from the store without removing them. Requires staff.update permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiParam({ name: 'roleId', description: 'The UUID of the role.' }),
		ApiParam({ name: 'userId', description: 'The UUID of the user.' }),
		ApiResponse({ status: 204, description: 'Member suspended successfully.' }),
		ApiResponse({ status: 403, description: 'Owner protected.' }),
		ApiResponse({ status: 404, description: 'Member not found.' }),
		ApiResponse({ status: 409, description: 'Member already suspended.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const UnsuspendRoleMemberDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Unsuspend store member',
			description:
				'Restores access for a suspended user. Requires staff.update permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiParam({ name: 'roleId', description: 'The UUID of the role.' }),
		ApiParam({ name: 'userId', description: 'The UUID of the user.' }),
		ApiResponse({
			status: 204,
			description: 'Member unsuspended successfully.',
		}),
		ApiResponse({ status: 404, description: 'Member not found.' }),
		ApiResponse({ status: 409, description: 'Member not suspended.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);
