import { InternalServerErrorException } from '@nestjs/common';

export class RealmNotDeclaredError extends InternalServerErrorException {
	readonly _tag = 'RealmNotDeclaredError';

	constructor(routePath: string) {
		super(
			`Route ${routePath} has no auth realm declared. Add @PlatformRoute(), @StorefrontRoute(), @PublicRoute(), or @WebhookRoute().`
		);
	}
}
