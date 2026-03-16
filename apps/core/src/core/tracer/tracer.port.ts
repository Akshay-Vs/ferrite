import { Attributes, Span } from '@opentelemetry/api';

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
		fn: (span: Span) => Promise<T>,
		attributes?: Attributes
	): Promise<T>;
}
