import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import {
	IRateLimiter,
	RateLimitConfig,
	RateLimitResult,
} from '../../domain/ports/rate-limiter.port';
import { STOREFRONT_REDIS } from '../redis/redis.provider';

@Injectable()
export class RedisRateLimiterAdapter implements IRateLimiter {
	constructor(@Inject(STOREFRONT_REDIS) private readonly redis: Redis) {}

	async check(config: RateLimitConfig): Promise<RateLimitResult> {
		const now = Date.now();
		const windowStart = now - config.windowMs;
		const randomId = randomBytes(8).toString('hex');

		const multi = this.redis.multi();
		multi.zremrangebyscore(config.key, 0, windowStart);
		multi.zadd(config.key, now, `${now}:${randomId}`);
		multi.zcard(config.key);
		multi.pexpire(config.key, config.windowMs); // pexpire uses ms directly

		const results = await multi.exec();
		if (!results) {
			throw new Error('Redis multi transaction failed');
		}

		for (const [err] of results) {
			if (err) {
				throw new Error(`Redis command failed: ${err.message || err}`);
			}
		}

		// results is an array of [error, result] for each command
		// zcard is the 3rd command (index 2)
		const zcardResult = results[2][1];

		let count = Number(zcardResult);
		if (!Number.isSafeInteger(count) || count < 0) {
			count = config.maxAttempts + 1; // Defensive fallback to prevent invalid remaining calculation
		}

		return {
			allowed: count <= config.maxAttempts,
			remaining: Math.max(0, config.maxAttempts - count),
		};
	}

	async reset(key: string): Promise<void> {
		await this.redis.del(key);
	}
}
