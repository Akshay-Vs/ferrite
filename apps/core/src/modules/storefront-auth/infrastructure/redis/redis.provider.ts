import type { FerriteConfig } from '@core/config/ferrite.schema';
import { Logger, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const STOREFRONT_REDIS = Symbol('STOREFRONT_REDIS');

export const StorefrontRedisProvider: Provider = {
	provide: STOREFRONT_REDIS,
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const ferriteConfig = config.getOrThrow<FerriteConfig>('ferrite');

		const redisPassword = config.getOrThrow('REDIS_SESSIONS_PASSWORD');
		const redisHost = config.getOrThrow('REDIS_SESSIONS_HOST');
		const redisPort = config.getOrThrow('REDIS_SESSIONS_PORT');

		const redisConfig = ferriteConfig.storefrontAuth.redis;

		const redis = new Redis({
			host: redisHost,
			port: redisPort,
			password: redisPassword,
			tls: redisConfig.tls ? {} : undefined,
			db: redisConfig.db,
			maxRetriesPerRequest: null,
		});

		redis.on('connect', () => {
			Logger.log('Storefront Auth Session store connected', 'StorefrontRedis');
		});

		redis.on('ready', () => {
			Logger.log('Storefront Auth Session store ready', 'StorefrontRedis');
		});

		redis.on('error', (err) => {
			Logger.error('Storefront Redis Error', err, 'StorefrontRedis');
		});
		return redis;
	},
};
