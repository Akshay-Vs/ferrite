import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const CreateCurrencyDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Create a new currency (staff+)',
			description:
				'Registers a new currency in the global registry. Code must be a unique 3-letter ISO 4217 code',
		}),
		ApiResponse({ status: 201, description: 'Currency created successfully.' }),
		ApiResponse({ status: 409, description: 'Currency code already exists.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const GetCurrenciesDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'List all currencies',
			description:
				'Returns all registered currencies. Use ?activeOnly=true to filter to active currencies only.',
		}),
		ApiQuery({
			name: 'activeOnly',
			required: false,
			type: Boolean,
			description: 'When true, returns only active currencies.',
		}),
		ApiResponse({ status: 200, description: 'Returns a list of currencies.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const GetCurrencyByCodeDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Get currency by code',
			description:
				'Returns a single currency by its ISO 4217 code (e.g. USD, EUR, JPY).',
		}),
		ApiParam({
			name: 'code',
			description: 'ISO 4217 currency code (3 uppercase letters).',
		}),
		ApiResponse({
			status: 200,
			description: 'Returns the currency information.',
		}),
		ApiResponse({ status: 404, description: 'Currency not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const UpdateCurrencyDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Update a currency (staff+)',
			description:
				'Partially updates a currency record (symbol, precision, active flag). Code is immutable.',
		}),
		ApiParam({
			name: 'code',
			description: 'ISO 4217 currency code (3 uppercase letters).',
		}),
		ApiResponse({ status: 200, description: 'Currency updated successfully.' }),
		ApiResponse({ status: 404, description: 'Currency not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);

export const DeleteCurrencyDocs = () =>
	applyDecorators(
		ApiOperation({
			summary: 'Delete a currency (staff+)',
			description:
				'Permanently removes a currency from the registry. Exchange rates referencing this currency will be cascade-deleted.',
		}),
		ApiParam({
			name: 'code',
			description: 'ISO 4217 currency code (3 uppercase letters).',
		}),
		ApiResponse({ status: 204, description: 'Currency deleted successfully.' }),
		ApiResponse({ status: 404, description: 'Currency not found.' }),
		ApiResponse({ status: 500, description: 'Internal server error.' })
	);
