import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_WEBHOOK_ROUTE = Symbol('IS_WEBHOOK_ROUTE');

export const WebhookRoute = (): CustomDecorator<typeof IS_WEBHOOK_ROUTE> =>
	SetMetadata(IS_WEBHOOK_ROUTE, true);
