import { SetMetadata } from '@nestjs/common';
import { WORKER_HANDLERS } from '..';

/**
 * @GraphileTask
 *
 *  Decorator for marking a class as a Graphile-worker task handler.
 *  The `GraphileDiscoveryService` will discover and wire the class as a handler.
 */
export const GraphileTask = (identifier: string) =>
	SetMetadata(WORKER_HANDLERS, identifier);
