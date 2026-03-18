import {
	createUserIdGenerator,
	GenerateUserId,
} from '@common/utils/generate-user-id.util';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const GENERATE_USER_ID = Symbol('GENERATE_USER_ID');

export const GenerateUserIdProvider: Provider = {
	provide: GENERATE_USER_ID,
	useFactory: (config: ConfigService): GenerateUserId =>
		createUserIdGenerator(config.getOrThrow('FERITE_CORE_PRIVATE_KEY')),
	inject: [ConfigService],
};
