import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/db.module';
import { LoggerModule } from './logger/logger.module';
import { RequestContextModule } from './request-context/request-context.module';
import { TracerModule } from './tracer/tracer.module';
import { WorkerModule } from './worker/worker.module';

@Global()
@Module({
	imports: [
		LoggerModule,
		RequestContextModule,
		TracerModule,
		ConfigModule,
		DatabaseModule,
		WorkerModule,
	],
	exports: [
		RequestContextModule,
		LoggerModule,
		TracerModule,
		ConfigModule,
		DatabaseModule,
		WorkerModule,
	],
})
export class CoreModule {}
