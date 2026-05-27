import type { IUseCase } from '@common/interfaces/use-case.interface';
import type { EmailTransitPayload } from '@ferrite/schema';
import type { EmailTransitError } from '../errors/email-transit.error';

export const SEND_EMAIL_UC = Symbol('SEND_EMAIL_UC');

export type ISendEmailUseCase = IUseCase<
	EmailTransitPayload,
	void,
	EmailTransitError
>;
