import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { noopRunnerOverrides } from './mock-runner.helper';

export type TestOverride = {
	provider: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	useValue: Record<string, any>;
};

/**
 * Bootstraps the NestJS application for E2E tests.
 *
 * Always applies no-op overrides for background runners
 * (e.g. Graphile worker) to prevent open handles during teardown.
 *
 * Additional `overrides` are merged in before compilation.
 */
export async function createTestApp(
	overrides: TestOverride[] = []
): Promise<INestApplication<App>> {
	let builder = Test.createTestingModule({ imports: [AppModule] });

	// Disable all background workers by default
	for (const { provider, useValue } of noopRunnerOverrides()) {
		builder = builder.overrideProvider(provider).useValue(useValue);
	}

	// Apply caller-supplied overrides
	for (const { provider, useValue } of overrides) {
		builder = builder.overrideProvider(provider).useValue(useValue);
	}

	const moduleFixture: TestingModule = await builder.compile();
	const app = moduleFixture.createNestApplication<INestApplication<App>>();
	await app.init();
	return app;
}
