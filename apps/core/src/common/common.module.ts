import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
	GENERATE_USER_ID,
	GenerateUserIdProvider,
} from './providers/generate-user-id.provider';

@Global()
@Module({
	imports: [ConfigModule],
	providers: [GenerateUserIdProvider],
	exports: [GENERATE_USER_ID],
})
export class CommonModules {}
