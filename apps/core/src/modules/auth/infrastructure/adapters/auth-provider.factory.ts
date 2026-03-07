import { IAuthAdapter } from '@modules/auth/domain/ports/auth-provider.port';
import { AuthProvider } from '@modules/auth/domain/types/auth-providers.enum';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkAdapter } from './providers/clerk';

@Injectable()
export class AuthProviderFactory {
	private readonly logger = new Logger(AuthProviderFactory.name);
	private readonly adapter: IAuthAdapter;

	private readonly adapters: Record<AuthProvider, IAuthAdapter>;

	constructor(
		private readonly config: ConfigService,
		private readonly clerk: ClerkAdapter
	) {
		this.adapters = {
			clerk: this.clerk,
		};

		this.adapter = this.resolve();
	}

	getAdapter(): IAuthAdapter {
		return this.adapter;
	}

	private resolve(): IAuthAdapter {
		const provider = this.config.get<AuthProvider>('AUTH_PROVIDER');

		this.assertValidProvider(provider);

		const adapter = this.adapters[provider];

		this.logger.log(`Auth provider resolved: ${provider}`);

		return adapter;
	}

	private assertValidProvider(
		provider: unknown
	): asserts provider is AuthProvider {
		if (!provider) {
			throw new Error(
				'AUTH_PROVIDER env var is not set. Valid values: clerk | firebase | kinde'
			);
		}

		if (!this.isValidProvider(provider)) {
			throw new Error(
				`Invalid AUTH_PROVIDER: "${provider}". Valid values: ${this.validProviders().join(' | ')}`
			);
		}
	}

	private isValidProvider(provider: unknown): provider is AuthProvider {
		return this.validProviders().includes(provider as AuthProvider);
	}

	private validProviders(): AuthProvider[] {
		return Object.keys(this.adapters) as AuthProvider[];
	}
}
