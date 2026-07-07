import { Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { StorefrontUserLogin } from '@ferrite/schema/storefront-auth/login.zodschema';
import { StorefrontUserResponse } from '@ferrite/schema/storefront-auth/storefront-user.zodschema';
import { IStorefrontLoginUser } from '@modules/storefront-auth/domain/ports/login-usecase.port';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { IncompleteConfigurationError } from '@store/domain/errors/incomplete-configuration.error';

@Injectable()
export class LoginUseCase implements IStorefrontLoginUser {
	constructor(private readonly logger: AppLogger) {
		this.logger.setContext(this.constructor.name);
	}

	async execute(
		_input: StorefrontUserLogin
	): Promise<
		Result<StorefrontUserResponse, IncompleteConfigurationError | Error>
	> {
		throw new NotImplementedException('Not implemended yet');
	}
}
