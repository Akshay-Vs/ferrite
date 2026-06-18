import type { FerriteConfig } from '@core/config/ferrite.schema';
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, type Options, verify } from '@node-rs/argon2';

export const ARGON2 = Symbol('ARGON2');
export const ARGON2_OPTIONS = Symbol('ARGON2_OPTIONS');

export interface IArgon2 {
	hash: typeof hash;
	verify: typeof verify;
}

export const Argon2Provider: Provider<IArgon2> = {
	provide: ARGON2,
	useValue: { hash, verify },
};

export const Argon2OptionsProvider: Provider<Options> = {
	provide: ARGON2_OPTIONS,
	inject: [ConfigService],
	useFactory: (config: ConfigService): Options => {
		const ferriteConfig = config.getOrThrow<FerriteConfig>('ferrite');
		const argon2Config = ferriteConfig.storefrontAuth.argon2;

		const options: Options = {
			memoryCost: argon2Config.memoryCost,
			timeCost: argon2Config.timeCost,
			parallelism: argon2Config.parallelism,
			outputLen: argon2Config.outputLen,
			algorithm: 2, // Argon2id
		};

		if (argon2Config.salt) {
			options.salt = Buffer.from(argon2Config.salt);
		}

		const secret = config.get<string>('STOREFRONT_ARGON2_SECRET');
		if (secret) {
			options.secret = Buffer.from(secret);
		}

		return options;
	},
};
