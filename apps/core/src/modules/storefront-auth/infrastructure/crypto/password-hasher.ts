import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { IStorefrontPasswordHasher } from '@modules/storefront-auth/domain/ports/password-hasher.port';
import { Inject, Injectable } from '@nestjs/common';
import {
	ARGON2,
	ARGON2_OPTIONS,
	type Argon2Options,
	type IArgon2,
} from './argon2.provider';

@Injectable()
export class Argon2PasswordHasher implements IStorefrontPasswordHasher {
	constructor(
		private readonly logger: AppLogger,
		@Inject(OTEL_TRACER) private readonly otelTracer: ITracer,
		@Inject(ARGON2) private readonly argon2: IArgon2,
		@Inject(ARGON2_OPTIONS) private readonly options: Argon2Options
	) {
		this.logger.setContext(this.constructor.name);
	}

	async hash(password: string): Promise<string> {
		return this.otelTracer.withSpan('PasswordHasher.hash', async () => {
			this.logger.debug('Hashing password...');
			return await this.argon2.hash(password, this.options);
		});
	}

	async isValid(password: string, hashedPassword: string): Promise<boolean> {
		return this.otelTracer.withSpan('PasswordHasher.isValid', async () => {
			this.logger.debug('Verifying password...');
			return await this.argon2.verify(hashedPassword, password, this.options);
		});
	}
}
