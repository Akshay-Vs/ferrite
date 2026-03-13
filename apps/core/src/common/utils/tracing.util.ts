import { Span, SpanStatusCode, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('nestjs-app');

/**
 * Wraps an async method with an OTel span.
 * Automatically sets error status and records exceptions on failure.
 */
export async function withSpan<T>(
	name: string,
	fn: (span: Span) => Promise<T>,
	attributes?: Record<string, string>
): Promise<T> {
	return tracer.startActiveSpan(name, async (span) => {
		try {
			if (attributes) span.setAttributes(attributes);
			const result = await fn(span);
			span.setStatus({ code: SpanStatusCode.OK });
			return result;
		} catch (err) {
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: (err as Error).message,
			});
			span.recordException(err as Error);
			throw err;
		} finally {
			span.end();
		}
	});
}
