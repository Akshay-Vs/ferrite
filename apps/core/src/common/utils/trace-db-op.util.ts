// Span attribute keys (keep consistent with OTEL semantic conventions)

import { ITracer } from '@core/tracer';
import { SpanStatusCode } from '@opentelemetry/api';

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
	return tracer.withSpan(spanName, async (span) => {
		span.setAttributes({
			'db.system': DB_SYSTEM,
			'db.component': DB_COMPONENT,
			...attributes,
		});

		try {
			const result = await fn();
			span.setStatus({ code: SpanStatusCode.OK });
			return result;
		} catch (err) {
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: err instanceof Error ? err.message : String(err),
			});
			span.recordException(err as Error);
			throw err;
		} finally {
			span.end();
		}
	});
}
