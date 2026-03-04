/**
 * Factory helpers for building valid test data.
 * Each factory returns a minimal valid insert object with sensible defaults.
 * Pass `overrides` to customise specific fields.
 */

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
		email: `test-${emailCounter}-${Date.now()}@example.com`,
		...overrides,
	};
}

// ── Phones ───────────────────────────────

export function createTestPhone(
	userId: string,
	overrides: Partial<NewUserPhone> = {}
): NewUserPhone {
	return {
		userId,
		phone: `555${String(Date.now()).slice(-7)}`,
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
