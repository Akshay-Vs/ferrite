import { AppLogger } from '@core/logger/logger.service';
import { Login } from '@ferrite/schema/storefront-auth/login.zodschema';
import { ILogin } from '@modules/storefront-auth/domain/ports/login-usecase.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginUseCase implements ILogin {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(props: Login): Promise<boolean> {
		this.logger.log(`Attempting to login user: ${props.email}`);
		// TODO: Implement actual login logic (compare password hash, etc)
		return true;
	}
}
