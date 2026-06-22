# Sheet Router

The Sheet Router is a global, stack-based navigation system for sheet (drawer) overlays. It acts like a mobile app's navigation controller, allowing users to drill down into details (e.g., viewing an order, then viewing a product inside that order, then viewing a user profile) without losing context.

## Architecture

Instead of each widget managing its own boolean `isOpen` state and mounting multiple `<Sheet>` primitives, the application mounts a **single global `<SheetRouter>`** at the layout level.

Inside this single sheet is a **navigation stack**. When you navigate, you are pushing a new "screen" onto the stack. The `<SheetRouter>` component automatically handles:
- Keeping the physical sheet open as long as `stack.length > 0`.
- Rendering a dynamic header with a "Back" button when `stack.length > 1`.
- Animating the transition between screens (`motion/react` `AnimatePresence`).
- Catching `React.lazy` loading states with a local `<Suspense>` boundary so global loaders aren't triggered.

## The Registry Pattern & Type Safety

To avoid circular dependencies between the core router and domain-specific widgets, the Sheet Router uses a **registry pattern**.

1. **Central Type Definition**: All valid routes and their param shapes are defined centrally in [`sheet-route.types.ts`](./sheet-route.types.ts) within the `SheetRouteMap` interface.
2. **Screen Registration**: Each widget (e.g., orders) calls `registerScreen()` at module initialization time (e.g., in [`order-routes.ts`](../widgets/orders/sheets/order-routes.ts)) to map a route name to a specific React component and a human-readable title.
3. **Type Erasure at the Boundary**: While `registerScreen` strictly enforces that the component's props match the `SheetRouteMap` for that specific route, the internal registry map erases the type to `Record<string, string>`. This keeps all call sites 100% type-safe while satisfying TypeScript's strict contravariance rules for `React.ComponentType`.

## Navigation Logic & The Stack

Navigation is controlled via the `sheetRouter` object exported from [`sheet-router.store.ts`](./sheet-router.store.ts).

### API Surface

- `sheetRouter.push(name, params)`: Push a new screen onto the stack.
- `sheetRouter.replace(name, params)`: Replace the top screen (no stack growth).
- `sheetRouter.pop()`: Pop the top screen. If the stack hits 0, the sheet closes.
- `sheetRouter.popTo(name)`: Pop all frames until reaching the first instance of the named route.
- `sheetRouter.close()`: Clear the entire stack instantly.

### Cycle Detection & Deduping

The store implements smart logic to prevent bad navigation states:
- **Deduping**: If you call `push` for the exact route and params that are already on top of the stack, it is a no-op.
- **Cycle Prevention**: If you push a route that is identical to the one *immediately below* the current top frame (e.g., navigating A → B, then from B clicking a link back to A), the router will **collapse the operation into a `pop`**. This prevents infinite A ↔ B ↔ A ↔ B stack overflow.

### Stack Limit

The stack depth is strictly capped at **10 frames**. If a `push` exceeds this limit, the oldest frame (index 0) is dropped to prevent unbounded memory growth.

## Cross-Domain Routing

Because the `<SheetRouter>` is mounted at the root `(navigatable)` layout, it acts as a bridge between different domains.

For example, the Orders table can push an `order-details` screen. Inside that screen, clicking a user's avatar can push a `user-profile` screen (which belongs to the Users domain). This enables seamless, bidirectional navigation across the entire application without any prop-drilling or domain coupling.

## Adding a New Screen

1. Add the route name and params to `SheetRouteMap` in `sheet-route.types.ts`.
2. Create your screen component as a pure UI component. It should expect a `params` prop matching your route definition. Do **not** wrap it in a `<Sheet>` or `<SheetContent>`.
3. In your widget's `routes.ts` file, `React.lazy` load your component and call `registerScreen(name, { component, title })`.
4. Ensure your widget's `routes.ts` file is imported somewhere early in your widget's lifecycle (e.g., imported in the main table or page component) so the registration executes.

### Example

```tsx
// 1. sheet-route.types.ts
export interface SheetRouteMap {
  'my-feature': { itemId: string };
}

// 2. my-feature-screen.tsx
export default function MyFeatureScreen({ params }: { params: { itemId: string } }) {
  return <div>Item ID: {params.itemId}</div>;
}

// 3. my-feature-routes.ts
import { lazy } from 'react';
import { registerScreen } from '@/presentation/sheet-router/screen-registry';

const MyFeatureScreen = lazy(() => import('./my-feature-screen'));

registerScreen('my-feature', {
  component: MyFeatureScreen,
  title: 'My Feature Details',
});

// 4. my-table.tsx (or similar entry point)
import './my-feature-routes'; // execute registration
import { sheetRouter } from '@/presentation/sheet-router/sheet-router.store';

export function MyTable() {
  return (
    <button onClick={() => sheetRouter.push('my-feature', { itemId: '123' })}>
      Open Sheet
    </button>
  );
}
```
