import { TaskList } from 'graphile-worker';

/**
 * The worker registry interface.
 * Holds the workers discovered by the `GraphileDiscoveryService`.
 */
export interface IProcessorRegistry {
	/**
	 * Returns the task list.
	 */
	getTaskRunners(): TaskList;
}
