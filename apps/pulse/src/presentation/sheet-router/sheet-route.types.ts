/**
 * Sheet Route Type System
 *
 * All sheet routes are defined centrally in this file.
 * Each domain adds its routes to the SheetRouteMap interface below.
 */

/** Route registry
 * Central type definition for all routes are defined here.
 * Keys are route names, values are route param shapes.
 * */
export interface SheetRouteMap {
	// Orders domain
	'order-details': { orderId: string };
	'product-details': { productId: string };
	'payment-details': { transactionId: string };
	'shipment-details': { orderId: string };

	'user-profile': { userId: string };
}

/// Derived types

/** A single stack frame — discriminated by `name`. */
export type SheetRoute = {
	[K in keyof SheetRouteMap]: { name: K; params: SheetRouteMap[K] };
}[keyof SheetRouteMap];

/** The name of any registered route. */
export type SheetRouteName = keyof SheetRouteMap;

/// Screen component contract

/** Props every screen component receives. */
export interface SheetScreenProps<K extends SheetRouteName = SheetRouteName> {
	params: SheetRouteMap[K];
}

/** Registration entry for a screen. */
export interface SheetScreenEntry {
	component: React.ComponentType<{ params: Record<string, string> }>;
	title: string;
}
