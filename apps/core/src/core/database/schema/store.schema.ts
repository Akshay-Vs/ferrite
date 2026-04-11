import { sql } from 'drizzle-orm';
import {
	boolean,
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { permissions } from './permission.schema';
import { users } from './user.schema';

// ─────────────────────────────────────────
// STORES
// ─────────────────────────────────────────

export const stores = pgTable(
	'stores',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 150 }).notNull(),
		slug: varchar('slug', { length: 150 }).notNull(),
		description: text('description'),
		bannerUrl: varchar('banner_url', { length: 2048 }),
		iconUrl: varchar('icon_url', { length: 2048 }),
		createdBy: uuid('created_by')
			.notNull()
			.references(() => users.id, { onDelete: 'restrict' }),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
	},
	(t) => [
		// Read-heavy: store lookup by slug (public storefront URLs)
		uniqueIndex('uq_stores_slug').on(t.slug),
		// Dashboard: list stores created by a user
		index('idx_stores_created_by').on(t.createdBy),
		// Sort by creation date
		index('idx_stores_created_at').on(t.createdAt),
		// Partial composite: active stores sorted by creation (listing page)
		index('idx_stores_active_created')
			.on(t.isActive, t.createdAt)
			.where(sql`is_active = true AND deleted_at IS NULL`),
	]
);

// ─────────────────────────────────────────
// STORE ROLES (admin-defined roles per store)
// ─────────────────────────────────────────

export const storeRoles = pgTable(
	'store_roles',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		storeId: uuid('store_id')
			.notNull()
			.references(() => stores.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		// System roles (e.g. "Admin") are seeded when a store is created
		// and cannot be deleted by the admin
		isSystem: boolean('is_system').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Role names unique within a store
		unique('uq_store_roles_store_name').on(t.storeId, t.name),
		// Read-heavy: list all roles for a store
		index('idx_store_roles_store_id').on(t.storeId),
	]
);

// ─────────────────────────────────────────
// STORE ROLE PERMISSIONS (fine-grained access)
// ─────────────────────────────────────────

export const storeRolePermissions = pgTable(
	'store_role_permissions',
	{
		storeRoleId: uuid('store_role_id')
			.notNull()
			.references(() => storeRoles.id, { onDelete: 'cascade' }),
		permissionId: uuid('permission_id')
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' }),
		grantedAt: timestamp('granted_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		primaryKey({ columns: [t.storeRoleId, t.permissionId] }),
		// "What can this store role do?"
		index('idx_store_role_permissions_role_id').on(t.storeRoleId),
		// "Which store roles have this permission?"
		index('idx_store_role_permissions_permission_id').on(t.permissionId),
	]
);

// ─────────────────────────────────────────
// STORE MEMBERS
// ─────────────────────────────────────────

export const storeMembers = pgTable(
	'store_members',
	{
		storeId: uuid('store_id')
			.notNull()
			.references(() => stores.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		roleId: uuid('role_id')
			.notNull()
			.references(() => storeRoles.id, { onDelete: 'restrict' }),
		isOwner: boolean('is_owner').notNull().default(false),
		joinedAt: timestamp('joined_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// Composite PK: one membership per user per store
		primaryKey({ columns: [t.storeId, t.userId] }),
		// Enforces exactly one owner per store
		uniqueIndex('uq_store_members_one_owner_per_store')
			.on(t.storeId, t.isOwner)
			.where(sql`is_owner = true`),
		// Read-heavy: list all stores a user belongs to
		index('idx_store_members_user_id').on(t.userId),
		// Filter members by role within a store
		index('idx_store_members_store_role').on(t.storeId, t.roleId),
	]
);

// ─────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type StoreRole = typeof storeRoles.$inferSelect;
export type NewStoreRole = typeof storeRoles.$inferInsert;

export type StoreRolePermission = typeof storeRolePermissions.$inferSelect;
export type NewStoreRolePermission = typeof storeRolePermissions.$inferInsert;

export type StoreMember = typeof storeMembers.$inferSelect;
export type NewStoreMember = typeof storeMembers.$inferInsert;
