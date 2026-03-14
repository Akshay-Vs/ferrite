import { WebhookRequest } from '@common/types/request';
import { WebhookPayload } from '@common/types/webhook-payload.type';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constrain';
import { VerifyWebhookUseCase } from '@modules/auth/application/use-cases/verify-webhook.usecase';
import {
	CanActivate,
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

	async canActivate(context: any): Promise<boolean> {
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

			const payload: WebhookPayload = {
				body: request.body,
				headers: request.headers,
			};

			const claims = await this.verifyWebhook.execute(payload);

			if (claims.isErr()) {
				this.logger.error(`Failed to verify webhook: ${claims.error.message}`);
				throw new UnauthorizedException('Invalid webhook signature');
			}

			request.rawClaims = claims.value;

			this.logger.debug('Successfully verified webhook');

			return true;
		});
	}
}
