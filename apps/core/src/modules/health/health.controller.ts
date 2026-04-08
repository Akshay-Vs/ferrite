import { type AuthUser } from '@auth/index';
import { AuthUserParam } from '@common/decorators/auth-user.decorator';
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
	constructor(private healthService: HealthService) {}

	@Get('hello')
	getHello(@AuthUserParam() user: AuthUser) {
		return this.healthService.hello(user);
	}
}
