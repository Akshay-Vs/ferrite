import { AuthProvider, authProvidersEnum } from '@auth/index';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
	IWebhookMapper,
	WEBHOOK_MAPPER,
} from '@users/domain/ports/webhook-mapper.port';
import { IWebhookMapperRegistry } from '@users/domain/ports/webhook-mapper.registry.port';

@Injectable()
export class WebhookMapperRegistry implements IWebhookMapperRegistry {
	private readonly logger = new Logger(WebhookMapperRegistry.name);
	private readonly mappers: Map<AuthProvider, IWebhookMapper>;

	constructor(@Inject(WEBHOOK_MAPPER) mappers: IWebhookMapper[]) {
		const seen = new Set<AuthProvider>();
		for (const mapper of mappers) {
			if (seen.has(mapper.provider)) {
				throw new Error(
					`Duplicate webhook mapper registered for provider: "${mapper.provider}"`
				);
			}
			seen.add(mapper.provider);
		}
		this.mappers = new Map(mappers.map((m) => [m.provider, m]));
	}

	resolve(provider: AuthProvider): IWebhookMapper {
		this.assertValidProvider(provider);
		const mapper = this.mappers.get(provider)!;
		this.logger.log(`Webhook mapper resolved: ${provider}`);
		return mapper;
	}

	private assertValidProvider(
		provider: unknown
	): asserts provider is AuthProvider {
		const valid = Object.values(authProvidersEnum);
		if (!provider) {
			throw new Error(
				`Webhook provider is not set. Valid values: ${valid.join(' | ')}`
			);
		}
		if (!this.mappers.has(provider as AuthProvider)) {
			throw new Error(
				`No mapper registered for provider: "${provider}". Valid values: ${valid.join(' | ')}`
			);
		}
	}
}
