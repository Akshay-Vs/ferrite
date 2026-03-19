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
}
