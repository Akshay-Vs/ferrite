import { sql } from 'drizzle-orm';
import {
	boolean,
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import {
	overrideTypeEnum,
	permissionActionEnum,
	permissionResourceEnum,
	staffStatusEnum,
} from './enum';
import { users } from './user.schema';

// ─────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────

export const roles = pgTable(
	'roles',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: varchar('name', { length: 100 }).notNull(),
		description: text('description'),
		isSystem: boolean('is_system').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		unique('uq_roles_name').on(t.name),
		index('idx_roles_created_at').on(t.createdAt),
		index('idx_roles_is_system').on(t.isSystem),
	]
);

//? Seeded at deploy time — never inserted at runtime.
export const permissions = pgTable(
	'permissions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		resource: permissionResourceEnum('resource').notNull(),
		action: permissionActionEnum('action').notNull(),
		description: text('description'),
	},
	(t) => [
		unique('uq_permission_resource_action').on(t.resource, t.action),
		index('idx_permissions_resource').on(t.resource),
		index('idx_permissions_lookup').on(t.resource, t.action),
	]
);

// ─────────────────────────────────────────
// ROLE PERMISSIONS
// ─────────────────────────────────────────

export const rolePermissions = pgTable(
	'role_permissions',
	{
		roleId: uuid('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		permissionId: uuid('permission_id')
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' }),
		grantedAt: timestamp('granted_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		grantedBy: uuid('granted_by').references(() => staffMembers.id, {
			onDelete: 'set null',
		}),
	},
	(t) => [
		primaryKey({ columns: [t.roleId, t.permissionId] }),
		// Hottest RBAC query: "what can role X do?"
		index('idx_role_permissions_role_id').on(t.roleId),
		// Reverse: "which roles have this permission?"
		index('idx_role_permissions_permission_id').on(t.permissionId),
	]
);

// ─────────────────────────────────────────
// STAFF MEMBERS
// ─────────────────────────────────────────

export const staffMembers = pgTable(
	'staff_members',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		roleId: uuid('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'restrict' }),
		isOwner: boolean('is_owner').notNull().default(false),
		status: staffStatusEnum('status').notNull().default('invited'),
		invitedBy: uuid('invited_by').references(() => staffMembers.id, {
			onDelete: 'set null',
		}),
		invitedAt: timestamp('invited_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		joinedAt: timestamp('joined_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		unique('uq_staff_user_id').on(t.userId),
		index('idx_staff_user_id').on(t.userId),
		index('idx_staff_role_id').on(t.roleId),
		index('idx_staff_status').on(t.status),
		// Partial: only the one owner row — tiny, fast
		index('idx_staff_owner').on(t.isOwner).where(sql`is_owner = true`),
	]
);

// ─────────────────────────────────────────
// STAFF PERMISSION OVERRIDES
// ─────────────────────────────────────────

export const staffPermissionOverrides = pgTable(
	'staff_permission_overrides',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		staffId: uuid('staff_id')
			.notNull()
			.references(() => staffMembers.id, { onDelete: 'cascade' }),
		permissionId: uuid('permission_id')
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' }),
		type: overrideTypeEnum('type').notNull(),
		overriddenBy: uuid('overridden_by')
			.notNull()
			.references(() => staffMembers.id, { onDelete: 'restrict' }),
		reason: text('reason'),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		// One override per staff + permission — no conflicting grant+revoke rows
		unique('uq_staff_permission_override').on(t.staffId, t.permissionId),
		// Auth check: fetch all overrides for a staff member
		index('idx_overrides_staff_id').on(t.staffId),
		// Audit: which staff have an override for this permission?
		index('idx_overrides_permission_id').on(t.permissionId),
		// Security log: list all grants or revokes across the store
		index('idx_overrides_type').on(t.type),
	]
);

// ─────────────────────────────────────────
// PERMISSION KEY TYPE
// ─────────────────────────────────────────

export type PermissionKey =
	`${(typeof permissionResourceEnum.enumValues)[number]}:${(typeof permissionActionEnum.enumValues)[number]}`;
// e.g. "orders:cancel" | "products:create" | "inventory:manage_stock"

// ─────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

export type StaffMember = typeof staffMembers.$inferSelect;
export type NewStaffMember = typeof staffMembers.$inferInsert;

export type StaffPermissionOverride =
	typeof staffPermissionOverrides.$inferSelect;
export type NewStaffPermissionOverride =
	typeof staffPermissionOverrides.$inferInsert;
