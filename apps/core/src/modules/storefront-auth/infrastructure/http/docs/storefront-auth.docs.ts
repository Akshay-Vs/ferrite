import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const LoginUserDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Login a storefront user' }),
		ApiResponse({
			status: 200,
			description: 'Successfully logged in. Returns auth token.',
		}),
		ApiResponse({
			status: 401,
			description: 'Invalid credentials.',
		})
	);

export const RegisterUserDocs = () =>
	applyDecorators(
		ApiOperation({ summary: 'Register a new storefront user' }),
		ApiResponse({
			status: 201,
			description:
				'User successfully registered. Returns the new user profile.',
		}),
		ApiResponse({
			status: 400,
			description: 'Validation failed or bad request.',
		})
	);
