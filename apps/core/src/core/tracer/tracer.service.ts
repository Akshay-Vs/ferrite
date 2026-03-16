import { Injectable } from '@nestjs/common';
import {
	Attributes,
	Span,
	SpanStatusCode,
	Tracer,
	trace,
} from '@opentelemetry/api';
import { ITracer } from './tracer.port';

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
		fn: (span: Span) => Promise<T>,
		attributes?: Attributes
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
