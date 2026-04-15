import { TaskRunnerService } from '@modules/queue/infrastructure/runners/task-runner.service';
import type { TestOverride } from './app.helper';

/**
 * Returns no-op provider overrides for all background worker runners.
 *
 * This prevents Graphile worker from opening DB polling connections
 * during E2E tests, which would cause `afterAll` teardown to hang.
 */
export function noopRunnerOverrides(): TestOverride[] {
	return [
		{
			provider: TaskRunnerService,
			useValue: {
				onApplicationBootstrap: jest.fn(),
				onApplicationShutdown: jest.fn(),
			},
		},
	];
}
