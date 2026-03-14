import { WebhookPayload } from '@common/types/webhook-payload.type';
import { withSpan } from '@common/utils/tracing.util';
import { AppLogger } from '@core/logger/logger.service';
import { VerifyWebhookUseCase } from '@modules/auth/application/use-cases/verify-webhook.usecase';
import {
	CanActivate,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_WEBHOOK_ROUTE } from '../decorators/webhook-route.decorator';

@Injectable()
export class WebhookGuard implements CanActivate {
	constructor(
		private readonly logger: AppLogger,
		private readonly reflector: Reflector,
		private readonly verifyWebhook: VerifyWebhookUseCase
	) {
		this.logger.setContext(this.constructor.name);
	}

	async canActivate(context: any): Promise<boolean> {
		return withSpan('guards.webhook.canActivate', async (span) => {
			const isWebhook = this.reflector.getAllAndOverride<boolean>(
				IS_WEBHOOK_ROUTE,
				[context.getHandler(), context.getClass()]
			);

			if (!isWebhook) {
				this.logger.debug('Webhook route must be decorated with @WebhookRoute');
				throw new ForbiddenException(
					'Invalid webhook route: must be decorated with @WebhookRoute'
				);
			}

			const request: Request = context.switchToHttp().getRequest();

			const payload: WebhookPayload = {
				body: request.body,
				headers: request.headers,
			};

			const event = await this.verifyWebhook.execute(payload);

			if (event.isErr()) {
				this.logger.error(`Failed to verify webhook: ${event.error.message}`);
				throw new UnauthorizedException('Invalid webhook signature');
			}

			this.logger.debug('Successfully verified webhook');

			span.setAttributes({
				'guard.name': 'WebhookGuard',
				'http.route': request.route?.path ?? 'unknown',
			});

			return true;
		});
	}
}
