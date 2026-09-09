import { FerriteConfig } from '@core/config/ferrite.schema';
import { ConfigService } from '@nestjs/config';

const CONFIG_KEY = 'ferrite';

export const loadConfig = (config: ConfigService) =>
	config.getOrThrow<FerriteConfig>(CONFIG_KEY);
