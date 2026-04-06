import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ferriteConfig } from './ferrite.config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [ferriteConfig],
		}),
	],
	exports: [ConfigModule],
})
export class FerriteConfigModule {}
