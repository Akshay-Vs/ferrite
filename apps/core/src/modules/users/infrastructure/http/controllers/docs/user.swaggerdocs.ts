import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetOwnProfileDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get current user profile' }),
		ApiResponse({
			status: 200,
			description: 'Returns the authenticated user profile.',
		})
	);

export const UpdateOwnProfileDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Update current user profile' }),
		ApiBody({
			schema: {
				type: 'object',
				properties: {
					firstName: { type: 'string', maxLength: 100 },
					lastName: { type: 'string', maxLength: 100 },
					avatarUrl: {
						type: 'string',
						format: 'uri',
						maxLength: 2048,
					},
					dateOfBirth: { type: 'string', format: 'date' },
					preferredLocale: { type: 'string', maxLength: 10 },
					preferredCurrency: {
						type: 'string',
						minLength: 3,
						maxLength: 3,
					},
				},
			},
		}),
		ApiResponse({
			status: 200,
			description: 'Profile successfully updated and returned.',
		})
	);

export const DeleteOwnProfileDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Delete current user profile' }),
		ApiResponse({
			status: 200,
			description: 'Profile successfully deleted and returned.',
		})
	);

export const GetAllUsersDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'List all active users (staff+)' }),
		ApiResponse({
			status: 200,
			description: 'Returns an array of all active user profiles.',
		}),
		ApiResponse({ status: 401, description: 'Unauthenticated.' }),
		ApiResponse({
			status: 403,
			description: 'Insufficient role — requires staff or above.',
		})
	);

export const GetUserByIdDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get a user by ID (staff+)' }),
		ApiResponse({
			status: 200,
			description: 'Returns the user profile for the given UUID.',
		}),
		ApiResponse({ status: 401, description: 'Unauthenticated.' }),
		ApiResponse({
			status: 403,
			description: 'Insufficient role — requires staff or above.',
		}),
		ApiResponse({ status: 404, description: 'User not found.' })
	);

export const UpdateUserRoleDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Update user platform role (admin only)' }),
		ApiBody({
			schema: {
				type: 'object',
				properties: {
					role: { type: 'string', enum: ['admin', 'staff', 'user'] },
				},
				required: ['role'],
			},
		}),
		ApiResponse({
			status: 200,
			description:
				'Platform role successfully updated and user profile returned.',
		}),
		ApiResponse({ status: 401, description: 'Unauthenticated.' }),
		ApiResponse({
			status: 403,
			description: 'Insufficient role — requires admin.',
		}),
		ApiResponse({ status: 404, description: 'User not found.' })
	);
