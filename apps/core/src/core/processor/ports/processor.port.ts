import type { JobHelpers } from 'graphile-worker';

export interface IProcessor<TPayload = unknown> {
	execute(payload: TPayload, helpers?: JobHelpers): Promise<void>;
}
