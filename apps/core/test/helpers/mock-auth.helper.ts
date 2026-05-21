import { ok } from '@common/interfaces/result.interface';
import { JWT_TOKEN_UC } from '@modules/auth/domain/ports/use-case.port';
import { CHECK_STORE_PERMISSION_UC } from '@modules/store/domain/ports/role-use-cases.port';
import type { TestOverride } from './app.helper';

/** A valid bearer token used across all E2E test requests. */
export const BEARER_TOKEN = 'Bearer valid-token';

/** A stable test user injected by the mock AuthGuard. */
export const TEST_USER = { id: 'user-id' };

/**
 * Creates a mock `JwtTokenUseCase` that always returns
 * the shared TEST_USER and exposes its `execute` spy.
 */
export function createMockJwtUseCase() {
	const mock = { execute: jest.fn() };
	mock.execute.mockResolvedValue(ok(TEST_USER));
	return mock;
}

/**
 * Creates a mock `CheckStorePermissionUseCase` with its `execute` spy.
 * Call `.mockResolvedValue(ok(true))` / `.mockResolvedValue(ok(false))`
 * directly on the returned spy to control access in individual tests.
 */
export function createMockCheckPermissionUseCase() {
	return { execute: jest.fn() };
}

/**
 * Returns provider overrides for the two core auth use-cases used by guards.
 *
 * @param jwtMock   - value returned by createMockJwtUseCase()
 * @param permMock  - value returned by createMockCheckPermissionUseCase()
 */
export function authOverrides(
	jwtMock: ReturnType<typeof createMockJwtUseCase>,
	permMock: ReturnType<typeof createMockCheckPermissionUseCase>
): TestOverride[] {
	return [
		{ provider: JWT_TOKEN_UC, useValue: jwtMock },
		{ provider: CHECK_STORE_PERMISSION_UC, useValue: permMock },
	];
}
