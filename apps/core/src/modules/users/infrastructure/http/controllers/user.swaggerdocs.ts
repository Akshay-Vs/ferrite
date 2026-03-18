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
