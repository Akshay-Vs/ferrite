import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { EmailTransitPayload } from '@ferrite/schema';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailClientError } from '@notifications/domain/errors/email-client.error';
import { EmailTransitError } from '@notifications/domain/errors/email-transit.error';
import type { IEmailProvider } from '@notifications/domain/ports/email-provider.port';
import Mailgun from 'mailgun.js';
import {
	type APIErrorType,
	Interfaces,
	MailgunMessageData,
} from 'mailgun.js/definitions';

export class MailgunAdapter implements IEmailProvider {
	private readonly client: Interfaces.IMailgunClient;
	private readonly domain: string;
	private readonly defaultDesignator = 'Ferrite Core';

	constructor(
		private readonly config: ConfigService,
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {
		this.logger.setContext(this.constructor.name);
		const apiKey = this.config.getOrThrow<string>('MAILGUN_API_KEY');
		const baseUrl = this.config.getOrThrow<string>('MAILGUN_BASE_URL');
		this.domain = this.config.getOrThrow<string>('MAILGUN_SANDBOX_DOMAIN');

		const mailgunFactory = new Mailgun(FormData);
		this.client = mailgunFactory.client({
			key: apiKey,
			username: 'api',
			url: baseUrl,
		});
	}

	async sendEmail(
		payload: EmailTransitPayload
	): Promise<Result<void, EmailTransitError | EmailClientError>> {
		return this.tracer.withSpan('adapters.mailgun.dispatch', async () => {
			try {
				// Fallback Protocol: Default to the system identifier if the tenant is null
				const designator = payload.senderDesignator ?? this.defaultDesignator;

				// RFC 5322 String Synthesis
				const fromString = `"${designator}" <no-reply@${this.domain}>`;

				const messageData: MailgunMessageData = {
					from: fromString,
					to: [payload.recipient],
					template: payload.template,
					subject: payload.subject,
					'h:X-Mailgun-Variables': JSON.stringify(payload.payload),
				};

				const res = await this.client.messages.create(this.domain, messageData);

				this.logger.debug(`Mailgun transit completed: status ${res.status}`);
				return ok();
			} catch (error) {
				this.logger.error(`Mailgun transit failed: ${error}`);

				if (error && typeof error === 'object' && 'status' in error) {
					const apiError = error as APIErrorType;
					this.logger.error(
						`Mailgun API Error: ${apiError.status} - ${apiError.message}`
					);

					if (apiError.status >= 400 && apiError.status < 500) {
						return err(
							new EmailClientError(
								`Client error from MTA: ${apiError.message}`,
								apiError.status
							)
						);
					}
				}

				return err(new EmailTransitError('External MTA rejected the payload'));
			}
		});
	}
}
