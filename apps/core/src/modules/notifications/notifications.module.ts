import { ProcessorModule } from '@core/processor';
import { QueueModule } from '@modules/queue';
import { Module } from '@nestjs/common';
import { EnqueueSendEmailUseCase } from './application/use-cases/enqueue-send-email.usecase';
import { SendEmailUseCase } from './application/use-cases/send-email.usecase';
import { EMAIL_ADAPTER } from './domain/ports/email-provider.port';
import { ENQUEUE_SEND_EMAIL_UC } from './domain/ports/enqueue-email-producer.port';
import { SEND_EMAIL_UC } from './domain/ports/use-cases.port';
import { MailgunAdapter } from './infrastructure/adapters/mailgun.adapter';
import { SendEmailQueueProcessor } from './infrastructure/queue/send-email.processor';

const ports = [
	{
		provide: EMAIL_ADAPTER,
		useClass: MailgunAdapter,
	},
];

const useCases = [
	{
		provide: SEND_EMAIL_UC,
		useClass: SendEmailUseCase,
	},
	{
		provide: ENQUEUE_SEND_EMAIL_UC,
		useClass: EnqueueSendEmailUseCase,
	},
];

const processors = [SendEmailQueueProcessor];

@Module({
	imports: [QueueModule, ProcessorModule],
	providers: [...ports, ...useCases, ...processors],
	exports: [SEND_EMAIL_UC, ENQUEUE_SEND_EMAIL_UC],
})
export class NotificationsModule {}
