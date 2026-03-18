/**
 * Factory helpers for building valid test data.
 * Each factory returns a minimal valid insert object with sensible defaults.
 * Pass `overrides` to customise specific fields.
 */

import { v4 as uuidv4 } from 'uuid';
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

export function createTestUser(overrides: Partial<NewUser> = {}): NewUser {
	emailCounter += 1;
	return {
		id: uuidv4(),
		email: `test-${emailCounter}-${Date.now()}@example.com`,
		...overrides,
	};
}

// ── Phones ───────────────────────────────
let phoneCounter = 0;
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
