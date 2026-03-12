import { AuthUser } from '@auth/index';
import { AppLogger } from '@core/logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(HealthService.name);
	}

	hello(user: AuthUser) {
		this.logger.log('request received Hello');
		return {
			user,
			message: `Hello ${user.fullName} from Ferrite Core!`,
		};
	}
}
