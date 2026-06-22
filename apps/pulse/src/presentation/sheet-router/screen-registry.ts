import type {
	SheetRouteMap,
	SheetRouteName,
	SheetScreenEntry,
} from './sheet-route.types';

// Screen registry — route name → { component, title }

const registry = new Map<string, SheetScreenEntry>();

/**
 * Register a screen for a given route name.
 * Call this at module init time (e.g. in a `routes.ts` barrel file).
 */
export function registerScreen<K extends SheetRouteName>(
	name: K,
	entry: {
		component: React.ComponentType<{ params: SheetRouteMap[K] }>;
		title: string;
	}
): void {
	if (registry.has(name as string)) {
		console.warn(
			`[sheet-router] Screen "${String(name)}" is already registered. Overwriting.`
		);
	}
	registry.set(name as string, entry as unknown as SheetScreenEntry);
}

/** Look up a screen entry by route name. */
export function getScreen(name: string): SheetScreenEntry | undefined {
	return registry.get(name);
}

/** Get the title for a route name, with automatic formatting fallback. */
export function getScreenTitle(name: string): string {
	const entry = registry.get(name);
	if (entry?.title) return entry.title;

	// Fallback: 'order-details' → 'Order Details'
	return name
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}
