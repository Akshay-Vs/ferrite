/**
 * Minimal span abstraction exposed to callers of {@link ITracer.withSpan}.
 *
 * Only exposes `setAttributes` — span lifecycle (start, end, error recording)
 * is managed by the tracer implementation, not by consumers.
 */
export interface ISpan {
	setAttributes(attributes: SpanAttributes): void;
}

/**
 * OTel SpanKind values re-exported through the port so callers remain
 * vendor-agnostic and never import from `@opentelemetry/api` directly.
 */
export enum TracerSpanKind {
	INTERNAL = 0,
	SERVER = 1,
	CLIENT = 2,
	PRODUCER = 3,
	CONSUMER = 4,
}

/**
 * Key-value bag attached to a span.
 * Intentionally limited to primitive types to stay vendor-agnostic.
 */
export type SpanAttributes = Record<string, string | number | boolean>;

/**
 * Tracing port.
 *
 * Defines the contract for executing an async operation within a span.
 * Implementations are responsible for span creation, lifecycle management,
 * and attribute assignment.
 */
export interface ITracer {
	/**
	 * Start a span, execute `fn` within it, and end the span when complete.
	 *
	 * @param name Span name representing the traced operation.
	 * @param fn Async function executed with the created span.
	 * @param attributes Optional attributes set on span creation.
	 * @returns The result of the executed function.
	 */
	withSpan<T>(
		name: string,
		fn: (span: ISpan) => Promise<T>,
		attributes?: SpanAttributes
	): Promise<T>;

	/**
	 * Start an async span seamlessly continuing the trace encoded in `carrier`
	 * (W3C `traceparent` / `tracestate`), execute `fn` within it, and end it.
	 *
	 * Use this for async / decoupled workflows (e.g. outbox CDC, queue consumers)
	 * where the async execution should logically continue the original request's
	 * trace by becoming a child span of the propagated context.
	 *
	 * If `carrier` is absent or yields no valid span context, a new root span
	 * is automatically created, so the call is always safe.
	 *
	 * @param name       Span name.
	 * @param carrier    Optional W3C propagation carrier captured at publish time.
	 * @param fn         Async function executed with the created span.
	 * @param kind       SpanKind (defaults to CONSUMER).
	 * @param attributes Optional span attributes.
	 */
	withPropagatedSpan<T>(
		name: string,
		carrier: Record<string, string> | undefined,
		fn: (span: ISpan) => Promise<T>,
		kind?: TracerSpanKind,
		attributes?: SpanAttributes
	): Promise<T>;
}
