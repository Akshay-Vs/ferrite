/**
 * Factory helpers for building valid test data.
 * Each factory returns a minimal valid insert object with sensible defaults.
 * Pass `overrides` to customise specific fields.
 */

import type { NewUserPaymentMethod } from '../schema/payment.schema';
import type { NewUserNotificationPreference } from '../schema/preferences.schema';
import type {
	NewPermission,
	NewRole,
	NewRolePermission,
	NewStaffMember,
	NewStaffPermissionOverride,
} from '../schema/role.schema';
import type {
	NewUser,
	NewUserAddress,
	NewUserPhone,
} from '../schema/user.schema';

// ── Users ────────────────────────────────
let emailCounter = 0;

/**
 * Builds a NewUser object with a generated unique email and optional field overrides.
 *
 * @param overrides - Partial fields to merge into the generated user object; any provided fields replace the defaults.
 * @returns The created NewUser. The `email` defaults to a generated value like `test-<counter>-<timestamp>@example.com` unless `overrides.email` is provided. This function increments a module-scoped counter used to make generated emails unique.
 */
export function createTestUser(overrides: Partial<NewUser> = {}): NewUser {
	emailCounter += 1;
	return {
		email: `test-${emailCounter}-${Date.now()}@example.com`,
		...overrides,
	};
}

// ── Phones ───────────────────────────────
let phoneCounter = 0;
/**
 * Builds a minimal NewUserPhone object for tests with a generated phone number and sensible defaults.
 *
 * The `overrides` object is shallow-merged into the result to replace default fields. This function also
 * increments an internal phone counter to produce a unique phone number for each call.
 *
 * @param userId - The ID of the user to associate with the phone record
 * @param overrides - Partial fields to override the defaults on the generated NewUserPhone
 * @returns A NewUserPhone object containing `userId`, a generated `phone`, `countryCode`, and any overridden fields
 */
export function createTestPhone(
	userId: string,
	overrides: Partial<NewUserPhone> = {}
): NewUserPhone {
	phoneCounter = (phoneCounter + 1) % 10_000_000;
	return {
		userId,
		phone: `555${String(phoneCounter).padStart(7, '0')}`,
		countryCode: '+1',
		...overrides,
	};
}

// ── Addresses ────────────────────────────
export function createTestAddress(
	userId: string,
	overrides: Partial<NewUserAddress> = {}
): NewUserAddress {
	return {
		userId,
		firstName: 'Test',
		lastName: 'User',
		line1: '123 Test St',
		city: 'Testville',
		postalCode: '12345',
		country: 'US',
		...overrides,
	};
}

// ── Auth Providers ───────────────────────
export function createTestAuthProvider(
	userId: string,
	overrides: Record<string, unknown> = {}
) {
	return {
		userId,
		provider: 'clerk' as const,
		externalAuthId: `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		...overrides,
	};
}

// ── Payment Methods ──────────────────────
export function createTestPaymentMethod(
	userId: string,
	overrides: Partial<NewUserPaymentMethod> = {}
): NewUserPaymentMethod {
	return {
		userId,
		provider: 'stripe',
		providerPaymentMethodId: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		cardLast4: '4242',
		cardBrand: 'visa',
		...overrides,
	};
}

// ── Notification Preferences ─────────────
export function createTestNotificationPreference(
	userId: string,
	overrides: Partial<NewUserNotificationPreference> = {}
): NewUserNotificationPreference {
	return {
		userId,
		channel: 'email',
		type: 'promotions',
		isEnabled: true,
		...overrides,
	};
}

// ── Roles & Permissions ──────────────────
let roleCounter = 0;

export function createTestRole(overrides: Partial<NewRole> = {}): NewRole {
	roleCounter += 1;
	return {
		name: `Test Role ${roleCounter} - ${Date.now()}`,
		description: 'A role created for testing',
		isSystem: false,
		...overrides,
	};
}

export function createTestPermission(
	overrides: Partial<NewPermission> = {}
): NewPermission {
	return {
		resource: 'products',
		action: 'read',
		description: 'Permission to read products',
		...overrides,
	};
}

export function createTestRolePermission(
	roleId: string,
	permissionId: string,
	overrides: Partial<NewRolePermission> = {}
): NewRolePermission {
	return {
		roleId,
		permissionId,
		...overrides,
	};
}

// ── Staff Members ────────────────────────
export function createTestStaffMember(
	userId: string,
	roleId: string,
	overrides: Partial<NewStaffMember> = {}
): NewStaffMember {
	return {
		userId,
		roleId,
		isOwner: false,
		status: 'active',
		...overrides,
	};
}

export function createTestStaffPermissionOverride(
	staffId: string,
	permissionId: string,
	overriddenBy: string,
	overrides: Partial<NewStaffPermissionOverride> = {}
): NewStaffPermissionOverride {
	return {
		staffId,
		permissionId,
		type: 'grant',
		overriddenBy,
		reason: 'Test override',
		...overrides,
	};
}
