import { WebhookPayload } from '@auth/index';
import { IUseCase } from '@common/interfaces/use-case.interface';

export const PERSIST_WEBHOOK_UC = Symbol('PERSIST_WEBHOOK_UC');

export type IPersistWebhook = IUseCase<WebhookPayload, boolean>;
