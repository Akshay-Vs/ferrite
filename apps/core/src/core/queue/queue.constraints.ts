import { DefaultJobOptions } from 'bullmq';

export const DEFAULT_JOB_OPTIONS: DefaultJobOptions = {
	attempts: 3,
	backoff: { type: 'exponential', delay: 1000 },
	removeOnComplete: true,
	removeOnFail: { count: 5000, age: 7 * 24 * 60 * 60 }, // keep 5k failed jobs (atmost) for 7 days
};
