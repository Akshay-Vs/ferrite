import { relations } from 'drizzle-orm';
import { userAuthProviders } from './auth.schema';
import { currencies, exchangeRates } from './currency.schema';
import { userOnboarding } from './onboarding.schema';
import { userPaymentMethods } from './payment.schema';
import { userNotificationPreferences } from './preferences.schema';
import {
	storeInvitations,
	storeMembers,
	storeRolePermissions,
	storeRoles,
	stores,
} from './store.schema';
import { userAddresses, userPhones, users } from './user.schema';

// ─────────────────────────────────────────
// USER RELATIONS
// ─────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
	onboarding: one(userOnboarding),
	authProviders: many(userAuthProviders),
	phones: many(userPhones),
	addresses: many(userAddresses),
	notificationPreferences: many(userNotificationPreferences),
	paymentMethods: many(userPaymentMethods),
	createdStores: many(stores),
	storeMemberships: many(storeMembers),
	sentStoreInvitations: many(storeInvitations, { relationName: 'invitedBy' }),
}));

export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
	user: one(users, {
		fields: [userOnboarding.userId],
		references: [users.id],
	}),
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
// STORE RELATIONS
// ─────────────────────────────────────────

export const storesRelations = relations(stores, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [stores.createdBy],
		references: [users.id],
	}),
	members: many(storeMembers),
	roles: many(storeRoles),
	invitations: many(storeInvitations),
}));

export const storeRolesRelations = relations(storeRoles, ({ one, many }) => ({
	store: one(stores, {
		fields: [storeRoles.storeId],
		references: [stores.id],
	}),
	permissions: many(storeRolePermissions),
	members: many(storeMembers),
	invitations: many(storeInvitations),
}));

export const storeRolePermissionsRelations = relations(
	storeRolePermissions,
	({ one }) => ({
		storeRole: one(storeRoles, {
			fields: [storeRolePermissions.storeRoleId],
			references: [storeRoles.id],
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

export const storeInvitationsRelations = relations(
	storeInvitations,
	({ one }) => ({
		store: one(stores, {
			fields: [storeInvitations.storeId],
			references: [stores.id],
		}),
		role: one(storeRoles, {
			fields: [storeInvitations.roleId],
			references: [storeRoles.id],
		}),
		invitedBy: one(users, {
			fields: [storeInvitations.invitedBy],
			references: [users.id],
		}),
	})
);

// ─────────────────────────────────────────
// CURRENCY RELATIONS
// ─────────────────────────────────────────

export const currenciesRelations = relations(currencies, ({ many }) => ({
	ratesFrom: many(exchangeRates, { relationName: 'ratesFrom' }),
	ratesTo: many(exchangeRates, { relationName: 'ratesTo' }),
}));

export const exchangeRatesRelations = relations(exchangeRates, ({ one }) => ({
	fromCurrency: one(currencies, {
		fields: [exchangeRates.fromCurrencyCode],
		references: [currencies.code],
		relationName: 'ratesFrom',
	}),
	toCurrency: one(currencies, {
		fields: [exchangeRates.toCurrencyCode],
		references: [currencies.code],
		relationName: 'ratesTo',
	}),
}));
