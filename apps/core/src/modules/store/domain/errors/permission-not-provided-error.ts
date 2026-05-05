import { ForbiddenException } from '@nestjs/common';

export class PermissionNotProvidedError extends ForbiddenException {
	readonly _tag = 'PermissionNotProvidedError';

	constructor() {
		super(
			'No permissions provided for permission check, at least one is required'
		);
	}
}
