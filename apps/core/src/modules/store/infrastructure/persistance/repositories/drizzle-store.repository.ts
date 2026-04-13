import type { PermissionKey } from '@common/schemas/permissions.zodschema';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import {
	storeMembers,
	storeRolePermissions,
	storeRoles,
	stores,
} from '@core/database/schema';
import type { Store, StoreRole } from '@core/database/schema/store.schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { IStoreRepository } from '../../../domain/ports/store.repository.port';
import type { CreateStoreInput } from '../../../domain/schemas/create-store.zodschema';
import type { UpdateStoreInput } from '../../../domain/schemas/update-store.zodschema';

@Injectable()
export class DrizzleStoreRepository implements IStoreRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer
	) {}

	private getExecutor(tx: unknown): TDatabase {
		return tx ? (tx as TDatabase) : this.db;
	}

	async transaction<T>(cb: (tx: unknown) => Promise<T>): Promise<T> {
		return this.db.transaction(cb);
	}

	async createStore(
		tx: unknown,
		input: CreateStoreInput,
		createdBy: string
	): Promise<Store> {
		return traceDbOp(
			this.tracer,
			'db.stores.create',
			{ 'db.table': 'stores', 'db.operation': 'insert' },
			async () => {
				const [store] = await this.getExecutor(tx)
					.insert(stores)
					.values({
						name: input.name,
						slug: input.slug,
						description: input.description,
						bannerUrl: input.bannerUrl,
						iconUrl: input.iconUrl,
						createdBy,
					})
					.returning();
				return store!;
			}
		);
	}

	async softDeleteStore(tx: unknown, storeId: string): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.stores.softDelete',
			{ 'db.table': 'stores', 'db.operation': 'update' },
			async () => {
				const [store] = await this.getExecutor(tx)
					.update(stores)
					.set({ deletedAt: sql`now()`, isActive: false })
					.where(and(eq(stores.id, storeId), eq(stores.isActive, true)))
					.returning({ id: stores.id });
				return !!store;
			}
		);
	}

	async updateStore(
		tx: unknown,
		storeId: string,
		payload: UpdateStoreInput
	): Promise<Store | null> {
		return traceDbOp(
			this.tracer,
			'db.stores.update',
			{ 'db.table': 'stores', 'db.operation': 'update' },
			async () => {
				const [store] = await this.getExecutor(tx)
					.update(stores)
					.set({
						...payload,
						updatedAt: sql`now()`,
					})
					.where(and(eq(stores.id, storeId), sql`deleted_at IS NULL`))
					.returning();
				return store || null;
			}
		);
	}

	async createStoreRole(
		tx: unknown,
		storeId: string,
		name: string,
		description: string | null,
		isSystem: boolean,
		permissionKeys: PermissionKey[]
	): Promise<StoreRole> {
		return traceDbOp(
			this.tracer,
			'db.storeRoles.create',
			{ 'db.table': 'store_roles', 'db.operation': 'insert' },
			async () => {
				const executor = this.getExecutor(tx);

				// 1. Insert role
				const [role] = await executor
					.insert(storeRoles)
					.values({
						storeId,
						name,
						description,
						isSystem,
					})
					.returning();

				// 2. Map permissions and insert directly
				if (permissionKeys.length > 0) {
					await executor.insert(storeRolePermissions).values(
						permissionKeys.map((key) => ({
							storeRoleId: role!.id,
							permissionKey: key,
						}))
					);
				}

				return role!;
			}
		);
	}

	async addStoreMember(
		tx: unknown,
		storeId: string,
		userId: string,
		roleId: string,
		isOwner: boolean
	): Promise<void> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.add',
			{ 'db.table': 'store_members', 'db.operation': 'insert' },
			async () => {
				await this.getExecutor(tx).insert(storeMembers).values({
					storeId,
					userId,
					roleId,
					isOwner,
				});
			}
		);
	}

	async findById(storeId: string): Promise<Store | null> {
		return traceDbOp(
			this.tracer,
			'db.stores.findById',
			{ 'db.table': 'stores', 'db.operation': 'select' },
			async () => {
				const [store] = await this.db
					.select()
					.from(stores)
					.where(eq(stores.id, storeId));
				return store || null;
			}
		);
	}

	async findByUserId(userId: string): Promise<Store[]> {
		return traceDbOp(
			this.tracer,
			'db.stores.findByUserId',
			{ 'db.table': 'stores,store_members', 'db.operation': 'select' },
			async () => {
				// Query stores connected to members
				const userStores = await this.db
					.select({
						store: stores,
					})
					.from(storeMembers)
					.innerJoin(stores, eq(storeMembers.storeId, stores.id))
					.where(
						and(eq(storeMembers.userId, userId), sql`stores.deleted_at IS NULL`)
					)
					.orderBy(desc(stores.createdAt));

				return userStores.map((s) => s.store);
			}
		);
	}
}
