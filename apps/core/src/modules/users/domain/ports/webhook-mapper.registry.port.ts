import { AuthProvider } from '@auth/index';
import { IWebhookMapper } from './webhook-mapper.port';

export const WEBHOOK_MAPPER_REGISTRY = Symbol('WEBHOOK_MAPPER_REGISTRY');

export interface IWebhookMapperRegistry {
	resolve(provider: AuthProvider): IWebhookMapper;
}
