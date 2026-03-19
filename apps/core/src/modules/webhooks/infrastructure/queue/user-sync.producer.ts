import { WebhookPayload } from '@auth/index';
import { BaseProducer } from '@core/queue';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { USER_SYNC_QUEUE } from '@users/index';
import { IUserSyncProducer } from '@webhooks/domain/ports/user-sync-producer.port';
import { Queue } from 'bullmq';

@Injectable()
export class UserSyncProducer
	extends BaseProducer<WebhookPayload>
	implements IUserSyncProducer
{
	constructor(@InjectQueue(USER_SYNC_QUEUE) protected readonly queue: Queue) {
		super();
	}
}
