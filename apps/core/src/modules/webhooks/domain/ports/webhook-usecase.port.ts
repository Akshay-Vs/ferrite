import { IUseCase } from '@common/interfaces/use-case.interface';
import { WebhookEnvelope } from '@common/schemas/webhook-envelope.zodschema';

export const PERSIST_WEBHOOK_UC = Symbol('PERSIST_WEBHOOK_UC');

export type IPersistWebhook = IUseCase<WebhookEnvelope, boolean>;
