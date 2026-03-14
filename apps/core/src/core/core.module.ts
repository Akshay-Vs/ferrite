import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/db.module';
import { LoggerModule } from './logger/logger.module';
import { QueueModule } from './queue/module';
import { RequestContextModule } from './request-context/request-context.module';
import { TracerModule } from './tracer/tracer.module';

@Global()
@Module({
	imports: [
		RequestContextModule,
		LoggerModule,
		TracerModule,
		ConfigModule,
		DatabaseModule,
		QueueModule,
	],
	exports: [
		RequestContextModule,
		LoggerModule,
		TracerModule,
		ConfigModule,
		DatabaseModule,
		QueueModule,
	],
})
export class CoreModule {}
