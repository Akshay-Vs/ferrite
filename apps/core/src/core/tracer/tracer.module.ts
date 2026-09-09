import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OTEL_TRACER } from './tracer.constraint';
import { TracerService } from './tracer.service';

@Global()
@Module({
	imports: [ConfigModule],
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
