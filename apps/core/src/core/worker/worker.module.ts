import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { GraphileDiscoveryService } from './services/graphile-discovery.service';
import { WORKER_REGISTRY } from './worker.constraints';

@Module({
	imports: [DiscoveryModule],
	providers: [
		{
			provide: WORKER_REGISTRY,
			useClass: GraphileDiscoveryService,
		},
	],
	exports: [WORKER_REGISTRY],
})
export class WorkerModule {}
