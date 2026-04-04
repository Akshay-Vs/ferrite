import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { PROCESSOR_REGISTRY } from './processor.constraints';
import { GraphileDiscoveryService } from './services/graphile-discovery.service';

@Module({
	imports: [DiscoveryModule],
	providers: [
		{
			provide: PROCESSOR_REGISTRY,
			useClass: GraphileDiscoveryService,
		},
	],
	exports: [PROCESSOR_REGISTRY],
})
export class ProcessorModule {}
