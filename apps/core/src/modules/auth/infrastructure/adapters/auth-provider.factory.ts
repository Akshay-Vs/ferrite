import {
	ITokenAuth,
	IWebhookAuth,
} from '@auth/domain/ports/auth-provider.port';
import { AuthProvider } from '@auth/domain/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkAdapter } from './providers/clerk';

type AuthAdapterInstance = ITokenAuth & IWebhookAuth;

/**
 * Factory class responsible for resolving and providing the appropriate
 * authentication provider adapter based on the application configuration.
 */
@Injectable()
export class AuthProviderFactory {
	private readonly logger = new Logger(AuthProviderFactory.name);
	private readonly adapter: AuthAdapterInstance;
	private readonly adapters: Record<AuthProvider, AuthAdapterInstance>;

	/**
	 * Initializes the AuthProviderFactory.
	 * Registers available adapters and resolves the active one based on the configuration.
	 *
	 * @param config - The application configuration service.
	 * @param clerk - The Clerk authentication adapter.
	 */
	constructor(
		private readonly config: ConfigService,
		private readonly clerk: ClerkAdapter
		// private readonly kinde: KindeAdapter,
	) {
		this.adapters = {
			clerk: this.clerk,
			// kinde: this.kinde,
		};
		this.adapter = this.resolve();
	}

	/**
	 * Returns the currently active authentication adapter instance.
	 *
	 * @returns The resolved AuthAdapterInstance.
	 */
	getAdapter(): AuthAdapterInstance {
		return this.adapter;
	}

	/**
	 * Resolves the authentication adapter based on the 'AUTH_PROVIDER' configuration value.
	 * Validates the provider before returning its corresponding adapter.
	 *
	 * @returns The resolved AuthAdapterInstance.
	 * @throws Error if the 'AUTH_PROVIDER' configuration is missing or invalid.
	 */
	private resolve(): AuthAdapterInstance {
		const provider = this.config.get<AuthProvider>('AUTH_PROVIDER');
		this.assertValidProvider(provider);
		const adapter = this.adapters[provider];
		this.logger.log(`Auth provider resolved: ${provider}`);
		return adapter;
	}

	/**
	 * Asserts that the provided value is a valid authentication provider.
	 *
	 * @param provider - The provider value to validate.
	 * @throws Error if the provider is not set or is not a valid AuthProvider.
	 */
	private assertValidProvider(
		provider: unknown
	): asserts provider is AuthProvider {
		const valid = this.validProviders();

		if (!provider) {
			throw new Error(
				`AUTH_PROVIDER is not set. Valid values: ${valid.join(' | ')}`
			);
		}

		if (!valid.includes(provider as AuthProvider)) {
			throw new Error(
				`Invalid AUTH_PROVIDER: "${provider}". Valid values: ${valid.join(' | ')}`
			);
		}
	}

	/**
	 * Retrieves the list of valid authentication providers based on registered adapters.
	 *
	 * @returns An array of explicitly registered AuthProvider keys.
	 */
	private validProviders(): AuthProvider[] {
		return Object.keys(this.adapters) as AuthProvider[];
	}
}
