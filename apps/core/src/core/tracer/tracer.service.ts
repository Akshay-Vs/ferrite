import { Injectable } from '@nestjs/common';
import { SpanStatusCode, Tracer, trace } from '@opentelemetry/api';
import { type ISpan, type ITracer, type SpanAttributes } from './tracer.port';

@Injectable()
export class TracerService implements ITracer {
	readonly tracer: Tracer;

	constructor() {
		this.tracer = trace.getTracer('nestjs-app');
	}

	/**
	 * Wraps an async method with an OTel span.
	 * Automatically sets error status and records exceptions on failure.
	 */
	withSpan<T>(
		name: string,
		fn: (span: ISpan) => Promise<T>,
		attributes?: SpanAttributes
	): Promise<T> {
		return this.tracer.startActiveSpan(name, async (span) => {
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
}
