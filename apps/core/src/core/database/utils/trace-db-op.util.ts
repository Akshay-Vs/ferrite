// Span attribute keys (keep consistent with OTEL semantic conventions)

import { ITracer } from '@core/tracer';

const DB_SYSTEM = 'postgresql';
const DB_COMPONENT = 'drizzle-orm';

/**
 * Wraps a database operation inside an OTEL span.
 *
 * - Sets `db.system`, `db.component`, and an optional `db.table` attribute.
 * - Records the error on the span and re-throws so callers still receive it.
 * - Always ends the span in the `finally` block.
 */
export async function traceDbOp<T>(
	tracer: ITracer,
	spanName: string,
	attributes: Record<string, string>,
	fn: () => Promise<T>
): Promise<T> {
	return tracer.withSpan(spanName, () => fn(), {
		'db.system': DB_SYSTEM,
		'db.component': DB_COMPONENT,
		...attributes,
	});
}
