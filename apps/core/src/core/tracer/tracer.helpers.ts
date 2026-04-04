import { context, propagation } from '@opentelemetry/api';

export const getTraceContext = (): Record<string, string> => {
	const carrier: Record<string, string> = {};
	propagation.inject(context.active(), carrier);
	return carrier;
};
