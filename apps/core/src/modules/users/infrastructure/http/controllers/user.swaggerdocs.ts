import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

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
					firstName: { type: 'string', maxLength: 100, nullable: true },
					lastName: { type: 'string', maxLength: 100, nullable: true },
					avatarUrl: {
						type: 'string',
						format: 'uri',
						maxLength: 2048,
						nullable: true,
					},
					dateOfBirth: { type: 'string', format: 'date', nullable: true },
					preferredLocale: { type: 'string', maxLength: 10, nullable: true },
					preferredCurrency: {
						type: 'string',
						minLength: 3,
						maxLength: 3,
						nullable: true,
					},
				},
			},
		}),
		ApiResponse({ status: 200, description: 'Profile successfully updated.' })
	);

export const GetUserProfileByIdDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Get a user profile by ID' }),
		ApiParam({
			name: 'id',
			type: 'string',
			format: 'uuid',
			description: 'Internal User UUID',
		}),
		ApiResponse({
			status: 200,
			description: 'Returns the requested user profile.',
		}),
		ApiResponse({ status: 404, description: 'User not found.' })
	);
