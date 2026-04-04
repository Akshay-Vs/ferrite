import { ProcessorModule } from '@core/processor';
import { Module } from '@nestjs/common';
import { GraphileEnqueueEvent } from './application/use-case/graphile-enqueue-event';
import { QUEUE_REPOSITORY } from './domain/ports/queue.reposotory.port';
import { ENQUEUE_GRAPHILE_EVENT_UC } from './domain/ports/use-cases.port';
import { QueueRepository } from './infrastructure/persistance/repositories/queue.repository';
import { TaskRunnerService } from './infrastructure/runners/task-runner.service';

@Module({
	imports: [ProcessorModule],
	providers: [
		TaskRunnerService,
		{
			provide: QUEUE_REPOSITORY,
			useClass: QueueRepository,
		},
		{
			provide: ENQUEUE_GRAPHILE_EVENT_UC,
			useClass: GraphileEnqueueEvent,
		},
	],
	exports: [ENQUEUE_GRAPHILE_EVENT_UC],
})
export class QueueModule {}
