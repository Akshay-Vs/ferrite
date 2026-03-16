import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
		BullModule.forRootAsync({
			useFactory: (config: ConfigService) => ({
				connection: {
					host: config.getOrThrow<string>('REDIS_HOST'),
					port: Number(config.getOrThrow<string>('REDIS_PORT')),
					password: config.getOrThrow<string>('REDIS_PASSWORD'),
				},
			}),
			inject: [ConfigService],
		}),
	],
	exports: [BullModule],
})
export class QueueModule {}
