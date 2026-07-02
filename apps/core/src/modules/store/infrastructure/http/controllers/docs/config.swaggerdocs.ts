import { applyDecorators } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
} from '@nestjs/swagger';
import { UpdateStoreConfigDto } from '../../dto/store-config.dto';

export function GetStoreConfigDocs() {
	return applyDecorators(
		ApiOperation({ summary: 'Get store configuration' }),
		ApiBearerAuth(),
		ApiParam({ name: 'storeId', type: 'string', format: 'uuid' }),
		ApiOkResponse({
			description: 'Store configuration retrieved successfully',
		})
	);
}

export function UpdateStoreConfigDocs() {
	return applyDecorators(
		ApiOperation({ summary: 'Update store configuration' }),
		ApiBearerAuth(),
		ApiParam({ name: 'storeId', type: 'string', format: 'uuid' }),
		ApiBody({ type: UpdateStoreConfigDto }),
		ApiOkResponse({
			description: 'Store configuration updated successfully',
		})
	);
}
