import { Injectable } from '@nestjs/common';
import {
	context,
	propagation,
	SpanKind,
	SpanStatusCode,
	Tracer,
	trace,
} from '@opentelemetry/api';
import {
	type ISpan,
	type ITracer,
	type SpanAttributes,
	TracerSpanKind,
} from './tracer.port';

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

	/**
	 * Creates an async span seamlessly continuing the trace carried in `carrier`.
	 */
	async withPropagatedSpan<T>(
		name: string,
		carrier: Record<string, string> | undefined,
		fn: (span: ISpan) => Promise<T>,
		kind: TracerSpanKind = TracerSpanKind.CONSUMER,
		attributes?: SpanAttributes
	): Promise<T> {
		const spanKind = kind as unknown as SpanKind;

		let activeContext = context.active();
		if (carrier) {
			activeContext = propagation.extract(activeContext, carrier);
		}

		// Start span within the extracted context to make it a child of the remote trace
		const span = this.tracer.startSpan(
			name,
			{ kind: spanKind, attributes },
			activeContext
		);

		// Activate the span for downstream calls inside fn
		const ctx = trace.setSpan(activeContext, span);
		return context.with(ctx, async () => {
			try {
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
