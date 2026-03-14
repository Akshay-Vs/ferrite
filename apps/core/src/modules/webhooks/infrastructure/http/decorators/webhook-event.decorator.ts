import { WebhookRequest } from '@common/types/request';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WebhookEvent = createParamDecorator(
	(_: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<WebhookRequest>();
		return request.webhookPayload;
	}
);
