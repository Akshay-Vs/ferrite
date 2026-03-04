# Database Schema Tests

This directory contains integration and schema tests for the Drizzle ORM database definitions. These tests run against a real PostgreSQL database instance to verify schema integrity, constraints (unique, foreign keys, defaults), and cascade behaviors.

## Overview

- **Test Runner**: Bun test
- **ORM**: Drizzle ORM
- **Database Driver**: `postgres.js`
- **Setup script**: `setup.ts`
- **Data factories**: `helpers.ts`

---

## The Testing Flow

1. **Global Setup (`setup.ts`)**
   - The test suite reads `DATABASE_URL` (typically a local test database or Docker container).
   - In `beforeAll()`, it connects to the database via `postgres.js` and initializes the Drizzle `db` instance.
   - In `afterAll()`, the database connection is closed safely.

2. **Isolation (`beforeEach`)**
   - Before every individual test (`it`), the `cleanupTables()` function runs all necessary `TRUNCATE TABLE ... CASCADE` queries.
   - This ensures a clean slate, avoiding unique constraint violations or bleeding state between tests.

3. **Data Factories (`helpers.ts`)**
   - We use factory functions (like `createTestUser()`) to generate minimal valid data objects.
   - This helps isolate test files from schema requirements to make sure they do not break when new, unrelated mandatory fields are added to schemas.

---

## How to Add More Schema Tests

When you create a new schema (e.g., `src/core/database/schema/inventory.schema.ts`), follow these steps to add tests for it:

### 1. Update the Cleanup Routine
Open `src/core/database/tests/setup.ts` and append your newly created tables to the `TRUNCATE TABLE` SQL statement inside the `cleanupTables()` function. This ensures your tests won't fail sequentially due to left-over insert data.

```typescript
export async function cleanupTables(): Promise<void> {
	await _db.execute(sql`
		TRUNCATE TABLE
			inventory_items, /* ADDED HERE */
			user_auth_providers,
            /* ...existing tables */
		CASCADE
	`);
}
```

### 2. Create Data Factories
Open `src/core/database/tests/helpers.ts` and add a new factory function for the new structure. Ensure it defines all `notNull()` properties of the schema.

```typescript
import type { NewInventoryItem } from '../schema/inventory.schema';

let inventoryCounter = 0;

export function createTestInventoryItem(
	overrides: Partial<NewInventoryItem> = {}
): NewInventoryItem {
    inventoryCounter++;
	return {
		sku: `TEST-SKU-${inventoryCounter}-${Date.now()}`,
		price: 1000,
		...overrides,
	};
}
```

### 3. Author the Test File
Create a new `[name].schema.spec.ts` file in this directory (e.g., `inventory.schema.spec.ts`).

Start by adding the standardized boilerplate to run migrations/hooks cleanly:

```typescript
import { eq } from 'drizzle-orm';
import { inventoryItems } from '../schema/inventory.schema';
import { createTestInventoryItem } from './helpers';
import { cleanupTables, db, setupTestDB, teardownTestDB } from './setup';

beforeAll(async () => {
	await setupTestDB();
});

afterAll(async () => {
	await teardownTestDB();
});

beforeEach(async () => {
	await cleanupTables();
});

describe('inventory_items table', () => {
	it('should insert an inventory item', async () => {
		const [item] = await db
            .insert(inventoryItems)
            .values(createTestInventoryItem())
            .returning();
            
		expect(item.id).toBeDefined();
		expect(item.sku).toMatch(/TEST-SKU/);
	});

    it('should reject a duplicate sku (uq_inventory_sku)', async () => {
        // Test constraints using try/catch or expect().toThrow() patterns
    });
});
```

### 4. Run the Tests
Run the test command to verify your schema implementations constraint validations are passing perfectly.
```bash
bun test src/core/database/tests
```
