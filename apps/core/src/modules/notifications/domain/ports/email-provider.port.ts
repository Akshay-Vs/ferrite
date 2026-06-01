import { Result } from '@common/interfaces/result.interface';
import { type EmailTransitPayload } from '@ferrite/schema';
import { EmailClientError } from '../errors/email-client.error';
import { EmailTransitError } from '../errors/email-transit.error';

export const EMAIL_ADAPTER = Symbol('EMAIL_ADAPTER');

export interface IEmailProvider {
	/**
	 * Sends an email to the specified recipients.
	 * @param payload `EmailTransitPayload` object containing recipient, template, subject, and template data.
	 */
	sendEmail(
		payload: EmailTransitPayload
	): Promise<Result<void, EmailTransitError | EmailClientError>>;
}
