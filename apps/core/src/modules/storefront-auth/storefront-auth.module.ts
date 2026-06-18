import { Module } from '@nestjs/common';
import {
	Argon2OptionsProvider,
	Argon2Provider,
} from './infrastructure/crypto/argon2.provider';

@Module({
	providers: [Argon2Provider, Argon2OptionsProvider],
})
export class StorefrontAuthModule {}
