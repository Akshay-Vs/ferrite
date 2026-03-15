import { AuthProvider, authProvidersEnum } from '@auth/index';
import { Injectable, Logger } from '@nestjs/common';
import { IWebhookMapper } from '@users/domain/ports/webhook-mapper.port';
import { ClerkWebhookMapper } from '../persistance/mappers/clerk-webhook.mapper';

/**
 * Factory class responsible for resolving and providing the appropriate
 * webhook mapper adapter based on the event provider.
 */
@Injectable()
export class WebhookMapperFactory {
	private readonly logger = new Logger(WebhookMapperFactory.name);
	private readonly mappers: Record<AuthProvider, IWebhookMapper>;

	constructor(
		private readonly clerk: ClerkWebhookMapper
		// private readonly kinde: KindeWebhookMapper,
	) {
		this.mappers = {
			[authProvidersEnum.clerk]: this.clerk,
			// [authProvidersEnum.kinde]: this.kinde,
		};
	}

	/**
	 * Resolves the appropriate mapper for the given provider.
	 *
	 * @param provider - The webhook provider to resolve a mapper for.
	 * @returns The resolved IWebhookMapper.
	 * @throws Error if no mapper is registered for the provider.
	 */
	resolve(provider: AuthProvider): IWebhookMapper {
		this.assertValidProvider(provider);
		const mapper = this.mappers[provider];
		this.logger.log(`Webhook mapper resolved: ${provider}`);
		return mapper;
	}

	private validProviders(): AuthProvider[] {
		return Object.values(authProvidersEnum);
	}

	private assertValidProvider(
		provider: unknown
	): asserts provider is AuthProvider {
		const valid = this.validProviders();
		if (!provider) {
			throw new Error(
				`Webhook provider is not set. Valid values: ${valid.join(' | ')}`
			);
		}
		if (!valid.includes(provider as AuthProvider)) {
			throw new Error(
				`No mapper registered for provider: "${provider}". Valid values: ${valid.join(' | ')}`
			);
		}
	}
}
