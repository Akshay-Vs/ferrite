import { AppLogger } from '@core/logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(HealthService.name);
	}

	hello() {
		this.logger.log('request received Hello');
		return 'Hello';
	}
}
