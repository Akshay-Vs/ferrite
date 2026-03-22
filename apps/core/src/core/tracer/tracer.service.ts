import { Injectable } from '@nestjs/common';
import {
	context,
	type Link,
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
	 * Creates a new root span linked to the trace carried in `carrier`.
	 *
	 * The span is NOT a child of the remote span, it is always a new root with
	 * a causal link, following the OTel async/messaging semantic convention.
	 * If `carrier` is absent or contains no valid span context the span is
	 * created without a link so the method is always safe to call.
	 */
	async withLinkedSpan<T>(
		name: string,
		carrier: Record<string, string> | undefined,
		fn: (span: ISpan) => Promise<T>,
		kind: TracerSpanKind = TracerSpanKind.CONSUMER,
		attributes?: SpanAttributes
	): Promise<T> {
		// Map the port enum value to the OTel SDK enum (same numeric values).
		const spanKind = kind as unknown as SpanKind;

		// Extract remote context from the carrier and, if present, build a link.
		const links: Link[] = [];
		if (carrier) {
			const remoteCtx = propagation.extract(context.active(), carrier);
			const remoteSpanCtx = trace.getSpanContext(remoteCtx);
			if (remoteSpanCtx) {
				links.push({ context: remoteSpanCtx });
			}
		}

		// Start a detached (root) span, pass ROOT_CONTEXT so it has no parent.
		const span = this.tracer.startSpan(
			name,
			{ kind: spanKind, links, attributes },
			// Explicitly pass an empty context so this span has no OTel parent,
			// making it a root span in a new trace.
			trace.deleteSpan(context.active())
		);

		// Activate the span for downstream calls inside fn.
		const ctx = trace.setSpan(context.active(), span);
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
