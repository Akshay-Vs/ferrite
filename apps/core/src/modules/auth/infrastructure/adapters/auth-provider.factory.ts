import {
	ITokenAuth,
	IWebhookAuth,
} from '@auth/domain/ports/auth-provider.port';
import { AuthProvider } from '@auth/domain/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkAdapter } from './providers/clerk';

type AuthAdapterInstance = ITokenAuth & IWebhookAuth;

@Injectable()
export class AuthProviderFactory {
	private readonly logger = new Logger(AuthProviderFactory.name);
	private readonly adapter: AuthAdapterInstance;
	private readonly adapters: Record<AuthProvider, AuthAdapterInstance>;

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

	getAdapter(): AuthAdapterInstance {
		return this.adapter;
	}

	private resolve(): AuthAdapterInstance {
		const provider = this.config.get<AuthProvider>('AUTH_PROVIDER');
		this.assertValidProvider(provider);
		const adapter = this.adapters[provider];
		this.logger.log(`Auth provider resolved: ${provider}`);
		return adapter;
	}

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

	private validProviders(): AuthProvider[] {
		return Object.keys(this.adapters) as AuthProvider[];
	}
}
