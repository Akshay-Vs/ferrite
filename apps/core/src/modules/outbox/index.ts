export type { IOutboxDispatcher } from './domain/ports/outbox-dispatcher.port';
export { OUTBOX_DISPATCHER } from './domain/ports/outbox-dispatcher.port';
export type { IOutboxRepository } from './domain/ports/outbox-repository.port';
export { OUTBOX_REPOSITORY } from './domain/ports/outbox-repository.port';
export type { DomainEvent } from './domain/schemas/domain-event';
export type { NewOutboxEventInput } from './domain/schemas/outbox-event.zodschema';
export { newOutboxEventSchema } from './domain/schemas/outbox-event.zodschema';
export { OutboxModule } from './outbox.module';
