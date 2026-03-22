import { NewOutboxEvent } from '@core/database/schema';
import {
	CreateOutboxEvent,
	OutboxEvent,
} from '@modules/outbox/domain/schemas/outbox-event.zodschema';

export class OutboxEventMapper {
	static toOutboxEvent<
		T extends Record<string, unknown> = Record<string, unknown>,
	>(raw: Record<string, unknown>): OutboxEvent<T> {
		return {
			eventId: raw.id as string,
			aggregateId: raw.aggregate_id as string,
			aggregateType: raw.aggregate_type as string,
			eventType: raw.event_type as string,
			queueName: raw.queue_name as string,
			payload: raw.payload as T,
			retryCount: raw.retry_count as number,
			maxRetries: raw.max_retries as number,
			createdAt: new Date(raw.created_at as string),
			__traceContext:
				(raw.trace_context as Record<string, string>) ?? undefined,
		};
	}

	static toNewOutboxEvent(event: CreateOutboxEvent): NewOutboxEvent {
		return {
			aggregateId: event.aggregateId,
			aggregateType: event.aggregateType,
			eventType: event.eventType,
			queueName: event.queueName,
			payload: event.payload,
			maxRetries: event.maxRetries,
			__traceContext: event.__traceContext,
		};
	}
}
