import { Inject, Injectable } from '@nestjs/common';
import { IWebhookMapper, WEBHOOK_MAPPER } from './webhook-mapper.port';

// ports/webhook-mapper.registry.ts
export const WEBHOOK_MAPPER_REGISTRY = Symbol('WEBHOOK_MAPPER_REGISTRY');

@Injectable()
export class WebhookMapperRegistry {
	private readonly mappers: Map<string, IWebhookMapper>;

	constructor(@Inject(WEBHOOK_MAPPER) mappers: IWebhookMapper[]) {
		this.mappers = new Map(mappers.map((m) => [m.provider, m]));
	}

	resolve(provider: string): IWebhookMapper {
		const mapper = this.mappers.get(provider);
		if (!mapper)
			throw new Error(`No mapper registered for provider: ${provider}`);
		return mapper;
	}
}
