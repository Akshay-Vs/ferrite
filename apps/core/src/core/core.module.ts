import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/db.module';
import { LoggerModule } from './logger/logger.module';
import { RequestContextModule } from './request-context/request-context.module';

@Global()
@Module({
	imports: [RequestContextModule, LoggerModule, ConfigModule, DatabaseModule],
})
export class CoreModule {}
