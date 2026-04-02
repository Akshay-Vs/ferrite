import { TaskList } from 'graphile-worker';

/**
 * The worker registry interface.
 * Holds the workers discovered by the `GraphileDiscoveryService`.
 */
export interface IWorkerRegistry {
	/**
	 * Returns the task list.
	 */
	getTaskRunners(): TaskList;
}
