import { WorkerModule } from '@core/worker';
import { Module } from '@nestjs/common';
import { InboxRunnerService } from './infrastructure/queue/runners/inbox-runner.service';

@Module({
	imports: [WorkerModule],
	providers: [InboxRunnerService],
	exports: [],
})
export class InboxModule {}
