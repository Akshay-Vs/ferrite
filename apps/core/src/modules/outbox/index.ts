export type { IOutboxRepository } from './domain/ports/outbox-repository.port';
export { OUTBOX_REPOSITORY } from './domain/ports/outbox-repository.port';
export type { DomainEvent } from './domain/schemas/domain-event';
export type { NewOutboxEventInput } from './domain/schemas/outbox-event.zodschema';
export { newOutboxEventSchema } from './domain/schemas/outbox-event.zodschema';
export { OutboxModule } from './outbox.module';
