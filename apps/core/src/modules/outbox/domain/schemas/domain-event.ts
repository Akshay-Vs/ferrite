/**
 * Framework-agnostic domain event envelope.
 *
 * Use cases construct domain events to describe side-effects that need
 * to be persisted alongside aggregate mutations (outbox pattern).
 * The infrastructure layer maps this to the persistence-specific schema.
 *
 * @template T  Payload type carried by the event.
 */
export interface DomainEvent<
	T extends Record<string, unknown> = Record<string, unknown>,
> {
	readonly aggregateId: string;
	readonly aggregateType: string;
	readonly eventType: string;
	readonly payload: T;
}
