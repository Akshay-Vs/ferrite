import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';
import { permissionActionEnum, permissionResourceEnum } from './enum';

// ─────────────────────────────────────────
// PERMISSIONS
//
// Canonical permission catalogue seeded at deploy time — never inserted at runtime.
// These are granular permissions strictly used by store-level roles.
// ─────────────────────────────────────────

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
// PERMISSION KEY TYPE
// ─────────────────────────────────────────

export type PermissionKey =
	`${(typeof permissionResourceEnum.enumValues)[number]}:${(typeof permissionActionEnum.enumValues)[number]}`;
// e.g. "orders:cancel" | "products:create" | "inventory:manage_stock"

// ─────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
