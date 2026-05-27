import { Result } from '@common/interfaces/result.interface';
import { ITransactionContext } from '@common/interfaces/unit-of-work.interface';
import { EmailTransitPayload } from '@ferrite/schema/notification/email.zodschema';

export const ENQUEUE_SEND_EMAIL_UC = Symbol('ENQUEUE_SEND_EMAIL_UC');

export interface IEnqueueSendEmail {
	execute(
		tx: ITransactionContext | undefined,
		payload: EmailTransitPayload
	): Promise<Result<void, Error>>;
}
