import { pgEnum } from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export const authProviderEnum = pgEnum('auth_provider', ['clerk']);

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

export const permissionResourceEnum = pgEnum('permission_resource', [
	'products',
	'categories',
	'orders',
	'returns',
	'customers',
	'support_tickets',
	'warehouse',
	'inventory',
	'suppliers',
	'purchase_orders',
	'promotions',
	'messages',
	'staff',
	'roles',
	'reports',
	'store_settings',
]);

export const permissionActionEnum = pgEnum('permission_action', [
	'create',
	'read',
	'update',
	'delete',
	'export', // download CSVs / reports
	'cancel', // cancel orders
	'refund', // issue refunds
	'assign', // assign tickets / orders to staff
	'send', // send messages / campaigns
	'schedule', // schedule campaigns or sales
	'activate', // activate promotions / flash sales
	'manage_stock', // adjust inventory levels
	'approve', // approve purchase orders / transfers
]);

export const staffStatusEnum = pgEnum('staff_status', [
	'active',
	'suspended',
	'invited', // invited but hasn't accepted yet
]);

export const overrideTypeEnum = pgEnum('override_type', [
	'grant', // give a permission the role doesn't have
	'revoke', // block a permission the role has
]);

export const addressTypeEnum = pgEnum('address_type', [
	'home',
	'work',
	'other',
]);
