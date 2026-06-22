import { create } from 'zustand';
import type {
	SheetRoute,
	SheetRouteMap,
	SheetRouteName,
} from './sheet-route.types';

/// State

const MAX_STACK_DEPTH = 10;

interface SheetRouterState {
	/** Navigation stack. Index 0 = bottom, last = top (visible). */
	stack: SheetRoute[];
	/** Animation direction — set before every state change. */
	direction: 'forward' | 'backward';
}

export const useSheetRouterStore = create<SheetRouterState>()(() => ({
	stack: [],
	direction: 'forward',
}));

/// Helpers

const routeEquals = (a: SheetRoute, b: SheetRoute): boolean => {
	return (
		a.name === b.name && JSON.stringify(a.params) === JSON.stringify(b.params)
	);
};

/**
 * Checks if pushing this route would create a back-and-forth cycle.
 *
 * If the route being pushed is identical to the one *below* the current top,
 * we pop instead of pushing — preventing A → B → A → B overflow.
 */
const wouldCycle = (stack: SheetRoute[], next: SheetRoute): boolean => {
	if (stack.length < 2) return false;
	const belowTop = stack.at(-2);
	if (!belowTop) return false;
	return routeEquals(belowTop, next);
};

/// Actions

/** Push a new screen onto the sheet stack. */
const push = <K extends SheetRouteName>(
	name: K,
	params: SheetRouteMap[K]
): void => {
	const route = { name, params } as SheetRoute;

	useSheetRouterStore.setState((state) => {
		// Dedup: If the top of the stack is already this exact route, no-op.
		const top = state.stack.at(-1);
		if (top && routeEquals(top, route)) return state;

		// Cycle detection: A → B → A collapses to just popping.
		if (wouldCycle(state.stack, route)) {
			return {
				stack: state.stack.slice(0, -1),
				direction: 'backward',
			};
		}

		// Enforce stack depth limit.
		const newStack = [...state.stack, route];
		if (newStack.length > MAX_STACK_DEPTH) {
			// Drop the oldest frame to stay within limit.
			newStack.shift();
		}

		return { stack: newStack, direction: 'forward' };
	});
};

/** Replace the current top screen (no stack growth). */
const replace = <K extends SheetRouteName>(
	name: K,
	params: SheetRouteMap[K]
): void => {
	const route = { name, params } as SheetRoute;

	useSheetRouterStore.setState((state) => {
		if (state.stack.length === 0) {
			return { stack: [route], direction: 'forward' };
		}
		const newStack = [...state.stack];
		newStack[newStack.length - 1] = route;
		return { stack: newStack, direction: 'forward' };
	});
};

/** Pop the top screen. If stack becomes empty, sheet closes. */
const pop = (): void => {
	useSheetRouterStore.setState((state) => ({
		stack: state.stack.slice(0, -1),
		direction: 'backward',
	}));
};

/** Pop all frames above the first occurrence of the named route. */
const popTo = <K extends SheetRouteName>(name: K): void => {
	useSheetRouterStore.setState((state) => {
		const idx = state.stack.findIndex((r) => r.name === name);
		if (idx === -1) return state;
		return {
			stack: state.stack.slice(0, idx + 1),
			direction: 'backward',
		};
	});
};

/** Clear the entire stack — sheet closes. */
const close = (): void => {
	useSheetRouterStore.setState({ stack: [], direction: 'backward' });
};

/** Get the current stack length (non-reactive). */
const getStackLength = (): number => {
	return useSheetRouterStore.getState().stack.length;
};

/// Public API object

export const sheetRouter = {
	push,
	replace,
	pop,
	popTo,
	close,
	getStackLength,
} as const;
