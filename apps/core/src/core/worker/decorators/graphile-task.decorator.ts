import { SetMetadata } from '@nestjs/common';
import { WORKER_HANDLERS } from '..';

/**
 * @GraphileTask
 *
 *  Decorator for marking a class method as a Graphile-worker task handler.
 *  The `GraphileExplorerService` will discover and wire the method as a handler.
 */
export const GraphileTask = (identifier: string) =>
	SetMetadata(WORKER_HANDLERS, identifier);
