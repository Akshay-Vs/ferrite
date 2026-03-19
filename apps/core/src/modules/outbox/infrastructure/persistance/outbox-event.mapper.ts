import { OutboxEvent } from '@core/database/schema';

export class OutboxEventMapper {
	static toOutboxEvent<
		T extends Record<string, unknown> = Record<string, unknown>,
	>(raw: Record<string, unknown>): OutboxEvent<T> {
		return {
			id: raw.id as string,
			aggregateId: raw.aggregate_id as string,
			aggregateType: raw.aggregate_type as string,
			eventType: raw.event_type as string,
			queueName: raw.queue_name as string,
			payload: raw.payload as T,
			status: raw.status as string,
			retryCount: raw.retry_count as number,
			maxRetries: raw.max_retries as number,
			errorDetail: raw.error_detail as string | null,
			scheduledAt: new Date(raw.scheduled_at as string),
			lockedAt: raw.locked_at ? new Date(raw.locked_at as string) : null,
			processedAt: raw.processed_at
				? new Date(raw.processed_at as string)
				: null,
			notifySentAt: raw.notify_sent_at
				? new Date(raw.notify_sent_at as string)
				: null,
			createdAt: new Date(raw.created_at as string),
		};
	}
}
