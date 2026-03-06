import { AppLogger } from '@core/logger/logger.service';
import {
	AUTH_PROVIDER,
	AuthUser,
	type IAuthProvider,
} from '@modules/auth/domain/ports/auth-provider.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class VerifyTokenUsecase {
	constructor(
		@Inject(AUTH_PROVIDER) private authProvider: IAuthProvider,
		private logger: AppLogger
	) {}

	async execute(token: string): Promise<AuthUser> {
		try {
			const user = await this.authProvider.verifyToken(token);
			return user;
		} catch (e) {
			this.logger.error(e);
			throw new Error('Unable to verify token');
		}
	}
}
