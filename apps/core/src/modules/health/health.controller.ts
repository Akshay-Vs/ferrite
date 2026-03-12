import { type AuthUser } from '@auth/index';
import { Controller, Get } from '@nestjs/common';
import { User } from '@users/index';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
	constructor(private healthService: HealthService) {}

	@Get('hello')
	getHello(@User() user: AuthUser) {
		return this.healthService.hello(user);
	}
}
