import { WebhookRequest } from '@common/types/request';
import { RawWebhookRequest } from '@common/types/webhook-payload.type';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { VerifyWebhookUseCase } from '@modules/auth/application/use-cases/verify-webhook.usecase';
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_WEBHOOK_ROUTE } from '../decorators/webhook-route.decorator';

@Injectable()
export class WebhookGuard implements CanActivate {
	constructor(
		private readonly logger: AppLogger,
		private readonly reflector: Reflector,
		private readonly verifyWebhook: VerifyWebhookUseCase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {
		this.logger.setContext(this.constructor.name);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		return this.tracer.withSpan('guards.webhook.canActivate', async (span) => {
			span.setAttributes({
				'guard.name': 'WebhookGuard',
			});

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

			const request: WebhookRequest = context.switchToHttp().getRequest();

			span.setAttributes({
				'http.route': request.route?.path ?? 'unknown',
			});

			const webhookRequest: RawWebhookRequest = {
				body: request.rawBody,
				headers: request.headers,
			};

			const payload = await this.verifyWebhook.execute(webhookRequest);

			if (payload.isErr()) {
				this.logger.error(`Failed to verify webhook: ${payload.error.message}`);
				throw new UnauthorizedException('Invalid webhook signature');
			}

			request.webhookPayload = payload.value;

			this.logger.debug('Successfully verified webhook');

			return true;
		});
	}
}
