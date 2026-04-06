import { Global, Module } from '@nestjs/common';
import { FerriteConfigModule } from './config/config.module';
import { DatabaseModule } from './database/db.module';
import { LoggerModule } from './logger/logger.module';
import { ProcessorModule } from './processor/processor.module';
import { RequestContextModule } from './request-context/request-context.module';
import { TracerModule } from './tracer/tracer.module';

@Global()
@Module({
	imports: [
		RequestContextModule,
		FerriteConfigModule,
		LoggerModule,
		TracerModule,
		DatabaseModule,
		ProcessorModule,
	],
	exports: [
		RequestContextModule,
		FerriteConfigModule,
		LoggerModule,
		TracerModule,
		DatabaseModule,
		ProcessorModule,
	],
})
export class CoreModules {}
