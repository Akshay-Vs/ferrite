import { Global, Module } from '@nestjs/common';
import { OTEL_TRACER } from './tracer.constrain';
import { TracerService } from './tracer.service';

@Global()
@Module({
	providers: [
		{
			provide: OTEL_TRACER,
			useFactory: () => {
				return new TracerService();
			},
		},
		TracerService,
	],
	exports: [TracerService, OTEL_TRACER],
})
export class TracerModule {}
