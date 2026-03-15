import { WebhookPayload } from '@auth/index';
import { ok, Result } from '@common/interfaces/result.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constrain';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserSyncProducer } from '@webhooks/infrastructure/queue/user-sync.producer';

@Injectable()
export class WebhookRouterUsecase implements IUseCase<WebhookPayload, boolean> {
	constructor(
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly userSync: UserSyncProducer
	) {
		this.logger.setContext(this.constructor.name);
	}
	async execute(payload: WebhookPayload): Promise<Result<boolean, Error>> {
		return this.tracer.withSpan(
			'webhook-router.execute',
			async () => {
				const { eventType } = payload;

				const traceCarrier: Record<string, string> = {};
				if (eventType.startsWith('user.')) {
					this.logger.debug(`Enqueueing user event ${eventType}`);
					await this.userSync.enqueue(payload, eventType);
				} else {
					this.logger.debug(`Unknown event ${eventType}`);
					throw new BadRequestException('Unknown event type');
				}

				return ok(true);
			},
			{
				'webhook-router.execute.id': payload?.eventId,
				'webhook-router.execute.type': payload?.eventType,
			}
		);
	}
}
