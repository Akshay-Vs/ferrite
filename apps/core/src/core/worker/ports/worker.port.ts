import type { JobHelpers } from 'graphile-worker';

export interface IWorker<TPayload = unknown> {
	execute(payload: TPayload, helpers: JobHelpers): Promise<void>;
}
