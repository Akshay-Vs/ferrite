import {
	type ITransactionContext,
	type IUnitOfWork,
	UNIT_OF_WORK,
} from '@common/interfaces/unit-of-work.interface';
import { generateSlug } from '@common/utils/generate-slug.util';
import { DB } from '@core/database/db.provider';
import type { TDatabase } from '@core/database/db.type';
import { DrizzleUnitOfWork } from '@core/database/drizzle-unit-of-work';
import {
	storeInvitations,
	storeMembers,
	storeRolePermissions,
	storeRoles,
	stores,
	users,
} from '@core/database/schema';
import type {
	Store,
	StoreMember,
	StoreRole,
} from '@core/database/schema/store.schema';
import { traceDbOp } from '@core/database/utils/trace-db-op.util';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer } from '@core/tracer';
import { OTEL_TRACER } from '@core/tracer/tracer.constraint';
import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
import type { CreateStoreInput } from '@ferrite/schema/stores/create-store.zodschema';
import { GetAllStores } from '@ferrite/schema/stores/get-store.zodschema';
import { GetStoreInvitationResponse } from '@ferrite/schema/stores/get-store-invitation.zodschema';
import type { UpdateStoreInput } from '@ferrite/schema/stores/update-store.zodschema';
import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, exists, gt, sql } from 'drizzle-orm';
import type { IStoreRepository } from '../../../domain/ports/store.repository.port';

@Injectable()
export class DrizzleStoreRepository implements IStoreRepository {
	constructor(
		@Inject(DB) private readonly db: TDatabase,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(AppLogger) private readonly appLogger: AppLogger
	) {
		this.appLogger.setContext(this.constructor.name);
	}

	private getExecutor(tx?: ITransactionContext): TDatabase {
		if (tx) return DrizzleUnitOfWork.unwrap(tx) as unknown as TDatabase;
		return this.db;
	}

	async transaction<T>(
		cb: (tx: ITransactionContext) => Promise<T>
	): Promise<T> {
		return this.uow.execute(cb);
	}

	async createStore(
		tx: ITransactionContext | undefined,
		input: CreateStoreInput,
		createdBy: string
	): Promise<Store> {
		return traceDbOp(
			this.tracer,
			'db.stores.create',
			{ 'db.table': 'stores', 'db.operation': 'insert' },
			async () => {
				const executor = this.getExecutor(tx);
				const [store] = await executor
					.insert(stores)
					.values({
						name: input.name,
						slug: generateSlug(input.name),
						description: input.description,
						currencyCode: input.currencyCode,
						bannerUrl: input.bannerUrl,
						icon: input.storeIcon,
						createdBy,
					})
					.returning();
				if (!store) throw new Error('Failed to create store');
				return store;
			}
		);
	}

	async softDeleteStore(
		tx: ITransactionContext | undefined,
		storeId: string
	): Promise<boolean> {
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
		tx: ITransactionContext | undefined,
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
		tx: ITransactionContext | undefined,
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

				if (!role) throw new Error('Failed to create store role');

				// 2. Map permissions and insert directly
				if (permissionKeys.length > 0) {
					await executor.insert(storeRolePermissions).values(
						permissionKeys.map((key) => ({
							storeRoleId: role.id,
							permissionKey: key,
						}))
					);
				}

				return role;
			}
		);
	}

	async inviteStoreMember(
		tx: ITransactionContext | undefined,
		email: string,
		storeId: string,
		invitedBy: string,
		expiresAt: Date,
		token: string,
		roleId: string
	): Promise<{ id: string }> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.invite',
			{ 'db.table': 'store_invitations', 'db.operation': 'insert' },
			async () => {
				const [invitation] = await this.getExecutor(tx)
					.insert(storeInvitations)
					.values({
						email,
						storeId,
						roleId,
						invitedBy,
						expiresAt,
						token,
					})
					.returning({ id: storeInvitations.id });

				if (!invitation) throw new Error('Failed to invite store member');
				return invitation;
			}
		);
	}

	async findInvitationByIdAndEmail(
		id: string,
		email: string
	): Promise<GetStoreInvitationResponse | null> {
		return traceDbOp(
			this.tracer,
			'db.storeInvitations.findByIdAndEmail',
			{ 'db.table': 'store_invitations', 'db.operation': 'select' },
			async () => {
				const [row] = await this.db
					.select({
						id: storeInvitations.id,
						email: storeInvitations.email,
						status: storeInvitations.status,
						invitedAt: storeInvitations.createdAt,
						expiresAt: storeInvitations.expiresAt,
						store: {
							id: stores.id,
							name: stores.name,
							slug: stores.slug,
						},
						role: {
							id: storeRoles.id,
							name: storeRoles.name,
						},
						invitedBy: {
							fullName: sql<string>`trim(concat(${users.firstName}, ' ', COALESCE(${users.lastName}, '')))`,
							email: users.email,
							avatarUrl: users.avatarUrl,
						},
					})
					.from(storeInvitations)
					.innerJoin(stores, eq(storeInvitations.storeId, stores.id))
					.innerJoin(storeRoles, eq(storeInvitations.roleId, storeRoles.id))
					.innerJoin(users, eq(storeInvitations.invitedBy, users.id))
					.where(
						and(
							eq(storeInvitations.id, id),
							eq(storeInvitations.email, email),
							sql`${stores.deletedAt} IS NULL`
						)
					);

				if (!row) return null;

				return {
					...row,
					invitedAt: row.invitedAt.toISOString(),
					expiresAt: row.expiresAt.toISOString(),
				};
			}
		);
	}

	async acceptInvitation(
		tx: ITransactionContext | undefined,
		id: string
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.storeInvitations.accept',
			{ 'db.table': 'store_invitations', 'db.operation': 'update' },
			async () => {
				const executor = this.getExecutor(tx);
				const [row] = await executor
					.update(storeInvitations)
					.set({ status: 'accepted' })
					.where(
						and(
							eq(storeInvitations.id, id),
							eq(storeInvitations.status, 'pending'),
							gt(storeInvitations.expiresAt, sql`now()`),
							exists(
								executor
									.select({ id: stores.id })
									.from(stores)
									.where(
										and(
											eq(stores.id, storeInvitations.storeId),
											sql`${stores.deletedAt} IS NULL`
										)
									)
							)
						)
					)
					.returning({ id: storeInvitations.id });
				return !!row;
			}
		);
	}

	async addStoreMember(
		tx: ITransactionContext | undefined,
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
				await this.getExecutor(tx)
					.insert(storeMembers)
					.values({
						storeId,
						userId,
						roleId,
						isOwner,
					})
					.onConflictDoNothing();
			}
		);
	}

	async addStoreMembers(
		tx: ITransactionContext | undefined,
		storeId: string,
		userIds: string[],
		roleId: string,
		isOwner: boolean
	): Promise<void> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.addBulk',
			{ 'db.table': 'store_members', 'db.operation': 'insert' },
			async () => {
				if (userIds.length === 0) return;

				const values = userIds.map((userId) => ({
					storeId,
					userId,
					roleId,
					isOwner,
				}));

				await this.getExecutor(tx)
					.insert(storeMembers)
					.values(values)
					.onConflictDoNothing();
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
					.where(and(eq(stores.id, storeId), sql`deleted_at IS NULL`));
				return store || null;
			}
		);
	}

	async findByUserId(
		userId: string,
		cursor?: string,
		limit: number = 10
	): Promise<{ items: GetAllStores[]; nextCursor?: string }> {
		return traceDbOp(
			this.tracer,
			'db.stores.findByUserId',
			{ 'db.table': 'stores,store_members', 'db.operation': 'select' },
			async () => {
				const offset = cursor ? parseInt(cursor, 10) : 0;
				const parsedLimit = limit > 0 ? limit : 10;

				const rows = await this.db
					.select({
						store: stores,
						isOwner: storeMembers.isOwner,
					})
					.from(storeMembers)
					.innerJoin(stores, eq(storeMembers.storeId, stores.id))
					.where(
						and(eq(storeMembers.userId, userId), sql`stores.deleted_at IS NULL`)
					)
					.orderBy(desc(stores.createdAt))
					.limit(parsedLimit + 1)
					.offset(offset);

				const hasNext = rows.length > parsedLimit;
				const fetchedRows = hasNext ? rows.slice(0, parsedLimit) : rows;

				const items = fetchedRows.map((r) => ({
					id: r.store.id,
					name: r.store.name,
					slug: r.store.slug,
					currencyCode: r.store.currencyCode,
					bannerUrl: r.store.bannerUrl ?? undefined,
					storeIcon: r.store.icon ?? undefined,
					isActive: r.store.isActive,
					isOwner: r.isOwner,
				}));

				return {
					items,
					nextCursor: hasNext ? (offset + parsedLimit).toString() : undefined,
				};
			}
		);
	}

	async findRolesByStoreId(storeId: string): Promise<StoreRole[]> {
		return traceDbOp(
			this.tracer,
			'db.storeRoles.findByStoreId',
			{ 'db.table': 'store_roles', 'db.operation': 'select' },
			async () => {
				return this.db
					.select()
					.from(storeRoles)
					.where(eq(storeRoles.storeId, storeId))
					.orderBy(desc(storeRoles.createdAt));
			}
		);
	}

	async findRolePermissions(
		storeId: string,
		roleId: string
	): Promise<PermissionKey[]> {
		return traceDbOp(
			this.tracer,
			'db.storeRolePermissions.find',
			{ 'db.table': 'store_role_permissions', 'db.operation': 'select' },
			async () => {
				const rows = await this.db
					.select({ permissionKey: storeRolePermissions.permissionKey })
					.from(storeRolePermissions)
					.innerJoin(
						storeRoles,
						eq(storeRolePermissions.storeRoleId, storeRoles.id)
					)
					.where(
						and(
							eq(storeRolePermissions.storeRoleId, roleId),
							eq(storeRoles.storeId, storeId)
						)
					);
				return rows.map((r) => r.permissionKey);
			}
		);
	}

	async findRoleMembers(
		storeId: string,
		roleId: string
	): Promise<StoreMember[]> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.findByRole',
			{ 'db.table': 'store_members', 'db.operation': 'select' },
			async () => {
				return this.db
					.select()
					.from(storeMembers)
					.where(
						and(
							eq(storeMembers.storeId, storeId),
							eq(storeMembers.roleId, roleId)
						)
					)
					.orderBy(desc(storeMembers.joinedAt));
			}
		);
	}

	async deleteStoreRole(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string
	): Promise<StoreRole | null> {
		return traceDbOp(
			this.tracer,
			'db.storeRoles.delete',
			{ 'db.table': 'store_roles', 'db.operation': 'delete' },
			async () => {
				const [role] = await this.getExecutor(tx)
					.delete(storeRoles)
					.where(
						and(
							eq(storeRoles.id, roleId),
							eq(storeRoles.storeId, storeId),
							eq(storeRoles.isSystem, false)
						)
					)
					.returning();
				return role || null;
			}
		);
	}

	async removeStoreMember(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		userId: string
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.remove',
			{ 'db.table': 'store_members', 'db.operation': 'delete' },
			async () => {
				const [deleted] = await this.getExecutor(tx)
					.delete(storeMembers)
					.where(
						and(
							eq(storeMembers.storeId, storeId),
							eq(storeMembers.roleId, roleId),
							eq(storeMembers.userId, userId)
						)
					)
					.returning({ storeId: storeMembers.storeId });
				return !!deleted;
			}
		);
	}

	async updateRolePermissions(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		permissions: PermissionKey[]
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.storeRolePermissions.update',
			{ 'db.table': 'store_role_permissions', 'db.operation': 'delete+insert' },
			async () => {
				const performUpdate = async (txn: ITransactionContext | undefined) => {
					const executor = this.getExecutor(txn);

					// First verify the role belongs to the store
					const [role] = await executor
						.select({ id: storeRoles.id })
						.from(storeRoles)
						.where(
							and(eq(storeRoles.id, roleId), eq(storeRoles.storeId, storeId))
						);

					if (!role) return false;

					await executor
						.delete(storeRolePermissions)
						.where(eq(storeRolePermissions.storeRoleId, roleId));

					if (permissions.length > 0) {
						await executor.insert(storeRolePermissions).values(
							permissions.map((key) => ({
								storeRoleId: roleId,
								permissionKey: key,
							}))
						);
					}

					return true;
				};

				return tx
					? performUpdate(tx)
					: this.transaction((newTx) => performUpdate(newTx));
			}
		);
	}

	async findRoleById(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string
	): Promise<StoreRole | null> {
		return traceDbOp(
			this.tracer,
			'db.storeRoles.findById',
			{ 'db.table': 'store_roles', 'db.operation': 'select' },
			async () => {
				const [role] = await this.getExecutor(tx)
					.select()
					.from(storeRoles)
					.where(
						and(eq(storeRoles.id, roleId), eq(storeRoles.storeId, storeId))
					);
				return role || null;
			}
		);
	}

	async isMemberOwner(
		tx: ITransactionContext | undefined,
		storeId: string,
		userId: string
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.isOwner',
			{ 'db.table': 'store_members', 'db.operation': 'select' },
			async () => {
				const [member] = await this.getExecutor(tx)
					.select({ isOwner: storeMembers.isOwner })
					.from(storeMembers)
					.where(
						and(
							eq(storeMembers.storeId, storeId),
							eq(storeMembers.userId, userId)
						)
					);
				return member?.isOwner ?? false;
			}
		);
	}

	async countRoleMembers(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string
	): Promise<number> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.countByRole',
			{ 'db.table': 'store_members', 'db.operation': 'select' },
			async () => {
				const [result] = await this.getExecutor(tx)
					.select({ count: sql<number>`cast(count(*) as integer)` })
					.from(storeMembers)
					.where(
						and(
							eq(storeMembers.storeId, storeId),
							eq(storeMembers.roleId, roleId)
						)
					);
				return result?.count ?? 0;
			}
		);
	}

	async suspendMember(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		userId: string
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.suspend',
			{ 'db.table': 'store_members', 'db.operation': 'update' },
			async () => {
				const [member] = await this.getExecutor(tx)
					.update(storeMembers)
					.set({ suspendedAt: sql`now()` })
					.where(
						and(
							eq(storeMembers.storeId, storeId),
							eq(storeMembers.roleId, roleId),
							eq(storeMembers.userId, userId),
							sql`suspended_at IS NULL`
						)
					)
					.returning({ storeId: storeMembers.storeId });
				return !!member;
			}
		);
	}

	async unsuspendMember(
		tx: ITransactionContext | undefined,
		storeId: string,
		roleId: string,
		userId: string
	): Promise<boolean> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.unsuspend',
			{ 'db.table': 'store_members', 'db.operation': 'update' },
			async () => {
				const [member] = await this.getExecutor(tx)
					.update(storeMembers)
					.set({ suspendedAt: null })
					.where(
						and(
							eq(storeMembers.storeId, storeId),
							eq(storeMembers.roleId, roleId),
							eq(storeMembers.userId, userId),
							sql`suspended_at IS NOT NULL`
						)
					)
					.returning({ storeId: storeMembers.storeId });
				return !!member;
			}
		);
	}

	async isMemberSuspended(
		tx: ITransactionContext | undefined,
		storeId: string,
		userId: string
	): Promise<boolean | null> {
		return traceDbOp(
			this.tracer,
			'db.storeMembers.isSuspended',
			{ 'db.table': 'store_members', 'db.operation': 'select' },
			async () => {
				const [member] = await this.getExecutor(tx)
					.select({ suspendedAt: storeMembers.suspendedAt })
					.from(storeMembers)
					.where(
						and(
							eq(storeMembers.storeId, storeId),
							eq(storeMembers.userId, userId)
						)
					);
				if (!member) return null;
				return member.suspendedAt !== null;
			}
		);
	}
}
