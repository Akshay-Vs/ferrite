import { pgEnum } from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export const authProviderEnum = pgEnum('auth_provider', ['clerk']);

export const platformRoleEnum = pgEnum('platform_role', [
	'admin',
	'staff',
	'user',
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
	'email',
	'sms',
	'push',
	'whatsapp',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
	'order_updates',
	'promotions',
	'restock',
	'price_drop',
	'support',
	'security',
]);

export const cardBrandEnum = pgEnum('card_brand', ['visa', 'mastercard']);

export const paymentProviderEnum = pgEnum('payment_provider', [
	'stripe',
	'paypal',
]);

import { STORE_PERMISSIONS } from '@common/schemas/permissions.zodschema';

export const permissionKeyEnum = pgEnum('permission_key', STORE_PERMISSIONS);

export const addressTypeEnum = pgEnum('address_type', [
	'home',
	'work',
	'other',
]);
