import { Result } from '@common/interfaces/result.interface';
import { type EmailTransitPayload } from '@ferrite/schema';
import { EmailTransitError } from '../errors/email-transit.error';

export const EMAIL_ADAPTER = Symbol('EMAIL_ADAPTER');

export interface IEmailProvider {
	/**
	 * Sends an email to the specified recipients.
	 * @param to The email address or addresses to send the email to.
	 * @param payload `EmailTransitPayload` object containing the email template and data.
	 * @param body The body of the email.
	 */
	sendEmail(
		payload: EmailTransitPayload
	): Promise<Result<void, EmailTransitError>>;
}
