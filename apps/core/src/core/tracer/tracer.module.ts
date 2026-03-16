import { Global, Module } from '@nestjs/common';
import { OTEL_TRACER } from './tracer.constraint';
import { TracerService } from './tracer.service';

@Global()
@Module({
	providers: [
		{
			provide: OTEL_TRACER,
			useExisting: TracerService,
		},
		TracerService,
	],
	exports: [TracerService, OTEL_TRACER],
})
export class TracerModule {}
