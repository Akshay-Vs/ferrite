import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { storeMembers, storeRolePermissions } from '@core/database/schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { IStorePermissionChecker } from '@modules/auth/domain/ports/store-permission-checker.port';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { and, eq } from 'drizzle-orm';

const CACHE_PREFIX = 'store-perms';

/**
 * Sentinel wrapper so `null` (non-member) is distinguishable from a cache miss
 * (`undefined`). Without this, `cache.get()` returning `null` for a
 * cached non-member looks identical to "key not found".
 */
interface CacheEntry {
	permissions: string[] | null;
}

@Injectable()
export class DrizzleStorePermissionRepository
	implements IStorePermissionChecker
{
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	async getPermissions(
		userId: string,
		storeId: string
	): Promise<string[] | null> {
		const cacheKey = `${CACHE_PREFIX}:${userId}:${storeId}`;

		// ── Cache hit → return immediately, never touch DB ──
		const cached = await this.cache.get<CacheEntry>(cacheKey);
		if (cached !== undefined && cached !== null) {
			this.tracer.withSpan('cache.storePermissions.hit', async (span) => {
				span.setAttributes({
					'cache.key': cacheKey,
					'cache.hit': true,
					'cache.permissions_count': cached.permissions?.length ?? 0,
				});
			});
			return cached.permissions;
		}

		// ── Cache miss → single DB round-trip ──
		const result = await this.queryPermissions(userId, storeId);

		// Wrap in sentinel before caching (preserves null vs undefined)
		await this.cache.set(cacheKey, {
			permissions: result,
		} satisfies CacheEntry);

		return result;
	}

	async invalidatePermissions(userId: string, storeId: string): Promise<void> {
		const cacheKey = `${CACHE_PREFIX}:${userId}:${storeId}`;
		await this.tracer.withSpan(
			'cache.storePermissions.invalidate',
			async (span) => {
				span.setAttributes({
					'cache.key': cacheKey,
					'cache.operation': 'invalidate',
				});
				await this.cache.del(cacheKey);
			}
		);
	}

	/**
	 * Single-query permission resolution:
	 *
	 * ```sql
	 * SELECT sm.role_id, p.key
	 * FROM   store_members sm
	 * LEFT JOIN store_role_permissions srp ON sm.role_id = srp.store_role_id
	 * LEFT JOIN permissions             p  ON srp.permission_id = p.id
	 * WHERE  sm.user_id = :userId AND sm.store_id = :storeId
	 * ```
	 *
	 * - 0 rows  → user is **not a member** → `null`
	 * - rows with `p.key IS NULL` → member, but role has **no permissions** → `[]`
	 * - rows with values → map to `"resource:action"` strings
	 */
	private async queryPermissions(
		userId: string,
		storeId: string
	): Promise<string[] | null> {
		return traceDbOp(
			this.tracer,
			'db.storePermissions.getByMember',
			{
				'db.table': 'store_members,store_role_permissions',
				'db.operation': 'select',
			},
			async () => {
				const rows = await this.db
					.select({
						roleId: storeMembers.roleId,
						key: storeRolePermissions.permissionKey,
					})
					.from(storeMembers)
					.leftJoin(
						storeRolePermissions,
						eq(storeMembers.roleId, storeRolePermissions.storeRoleId)
					)
					.where(
						and(
							eq(storeMembers.userId, userId),
							eq(storeMembers.storeId, storeId)
						)
					);

				// No rows → not a member
				if (rows.length === 0) {
					return null;
				}

				// Filter out LEFT JOIN nulls (member with no granted permissions)
				return rows.filter((r) => r.key !== null).map((r) => r.key!);
			}
		);
	}
}
