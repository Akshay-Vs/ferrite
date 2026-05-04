import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const CreateStoreDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Create a new store',
			description:
				'Initializes a new store with the providing details. The creator becomes the owner.',
		}),
		ApiResponse({ status: 201, description: 'Store created successfully.' }),
		ApiResponse({ status: 422, description: 'Unprocessable entity.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const GetOwnStoresDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get own stores',
			description: 'Returns a list of stores owned by the authenticated user.',
		}),
		ApiResponse({ status: 200, description: 'Returns a list of stores.' }),
		ApiResponse({ status: 422, description: 'Unprocessable entity.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const GetStoreByIdDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get store by ID',
			description: 'Returns public information about a store by its ID.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiResponse({ status: 200, description: 'Returns the store information.' }),
		ApiResponse({ status: 404, description: 'Store not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const UpdateStoreDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Update store',
			description:
				'Updates the details of a store. Requires store.update permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiResponse({ status: 200, description: 'Store updated successfully.' }),
		ApiResponse({ status: 404, description: 'Store not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const DeleteStoreDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Delete store',
			description: 'Deletes a store. Requires store.delete permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiResponse({ status: 204, description: 'Store deleted successfully.' }),
		ApiResponse({ status: 404, description: 'Store not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const AddStoreMembersDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Add members to store',
			description:
				'Bulk adds users to a store with a specific role. Requires staff.create permission.',
		}),
		ApiParam({ name: 'storeId', description: 'The UUID of the store.' }),
		ApiResponse({ status: 201, description: 'Members added successfully.' }),
		ApiResponse({ status: 400, description: 'Invalid input.' }),
		ApiResponse({ status: 404, description: 'Store not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);
