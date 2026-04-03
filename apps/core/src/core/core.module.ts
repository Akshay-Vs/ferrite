import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/db.module';
import { LoggerModule } from './logger/logger.module';
import { ProcessorModule } from './processor/processor.module';
import { RequestContextModule } from './request-context/request-context.module';
import { TracerModule } from './tracer/tracer.module';

@Global()
@Module({
	imports: [
		LoggerModule,
		RequestContextModule,
		TracerModule,
		ConfigModule,
		DatabaseModule,
		ProcessorModule,
	],
	exports: [
		RequestContextModule,
		LoggerModule,
		TracerModule,
		ConfigModule,
		DatabaseModule,
		ProcessorModule,
	],
})
export class CoreModules {}
