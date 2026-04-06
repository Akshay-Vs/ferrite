import { relations } from 'drizzle-orm';
import { userAuthProviders } from './auth.schema';
import { userPaymentMethods } from './payment.schema';
import { userNotificationPreferences } from './preferences.schema';
import {
	permissions,
	rolePermissions,
	roles,
	staffMembers,
	staffPermissionOverrides,
} from './role.schema';
import {
	storeMembers,
	storeRolePermissions,
	storeRoles,
	stores,
} from './store.schema';
import { userAddresses, userPhones, users } from './user.schema';

// ─────────────────────────────────────────
// USER RELATIONS
// ─────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
	authProviders: many(userAuthProviders),
	phones: many(userPhones),
	addresses: many(userAddresses),
	notificationPreferences: many(userNotificationPreferences),
	paymentMethods: many(userPaymentMethods),
	createdStores: many(stores),
	storeMemberships: many(storeMembers),
}));

export const userPhonesRelations = relations(userPhones, ({ one }) => ({
	user: one(users, {
		fields: [userPhones.userId],
		references: [users.id],
	}),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
	user: one(users, { fields: [userAddresses.userId], references: [users.id] }),
}));
export const userAuthProvidersRelations = relations(
	userAuthProviders,
	({ one }) => ({
		user: one(users, {
			fields: [userAuthProviders.userId],
			references: [users.id],
		}),
	})
);

export const userPaymentMethodsRelations = relations(
	userPaymentMethods,
	({ one }) => ({
		user: one(users, {
			fields: [userPaymentMethods.userId],
			references: [users.id],
		}),
	})
);

export const userNotificationPreferencesRelations = relations(
	userNotificationPreferences,
	({ one }) => ({
		user: one(users, {
			fields: [userNotificationPreferences.userId],
			references: [users.id],
		}),
	})
);

// ─────────────────────────────────────────
// ROLE RELATIONS
// ─────────────────────────────────────────

export const staffPermissionOverridesRelations = relations(
	staffPermissionOverrides,
	({ one }) => ({
		staff: one(staffMembers, {
			fields: [staffPermissionOverrides.staffId],
			references: [staffMembers.id],
			relationName: 'staffOverrides',
		}),
		permission: one(permissions, {
			fields: [staffPermissionOverrides.permissionId],
			references: [permissions.id],
		}),
		overriddenBy: one(staffMembers, {
			fields: [staffPermissionOverrides.overriddenBy],
			references: [staffMembers.id],
			relationName: 'grantedOverrides',
		}),
	})
);

export const staffMembersRelations = relations(
	staffMembers,
	({ one, many }) => ({
		user: one(users, { fields: [staffMembers.userId], references: [users.id] }),
		role: one(roles, { fields: [staffMembers.roleId], references: [roles.id] }),
		invitedByStaff: one(staffMembers, {
			fields: [staffMembers.invitedBy],
			references: [staffMembers.id],
		}),
		permissionOverrides: many(staffPermissionOverrides, {
			relationName: 'staffOverrides',
		}),
		grantedOverrides: many(staffPermissionOverrides, {
			relationName: 'grantedOverrides',
		}),
		grantedRolePermissions: many(rolePermissions),
	})
);

export const rolePermissionsRelations = relations(
	rolePermissions,
	({ one }) => ({
		role: one(roles, {
			fields: [rolePermissions.roleId],
			references: [roles.id],
		}),
		permission: one(permissions, {
			fields: [rolePermissions.permissionId],
			references: [permissions.id],
		}),
		grantedBy: one(staffMembers, {
			fields: [rolePermissions.grantedBy],
			references: [staffMembers.id],
		}),
	})
);

export const permissionsRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	staffPermissionOverrides: many(staffPermissionOverrides),
	storeRolePermissions: many(storeRolePermissions),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	staffMembers: many(staffMembers),
}));

// ─────────────────────────────────────────
// STORE RELATIONS
// ─────────────────────────────────────────

export const storesRelations = relations(stores, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [stores.createdBy],
		references: [users.id],
	}),
	members: many(storeMembers),
	roles: many(storeRoles),
}));

export const storeRolesRelations = relations(storeRoles, ({ one, many }) => ({
	store: one(stores, {
		fields: [storeRoles.storeId],
		references: [stores.id],
	}),
	permissions: many(storeRolePermissions),
	members: many(storeMembers),
}));

export const storeRolePermissionsRelations = relations(
	storeRolePermissions,
	({ one }) => ({
		storeRole: one(storeRoles, {
			fields: [storeRolePermissions.storeRoleId],
			references: [storeRoles.id],
		}),
		permission: one(permissions, {
			fields: [storeRolePermissions.permissionId],
			references: [permissions.id],
		}),
	})
);

export const storeMembersRelations = relations(storeMembers, ({ one }) => ({
	store: one(stores, {
		fields: [storeMembers.storeId],
		references: [stores.id],
	}),
	user: one(users, {
		fields: [storeMembers.userId],
		references: [users.id],
	}),
	role: one(storeRoles, {
		fields: [storeMembers.roleId],
		references: [storeRoles.id],
	}),
}));
