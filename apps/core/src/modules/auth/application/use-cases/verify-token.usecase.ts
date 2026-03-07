import { err, ok, Result } from '@common/interfaces/result.interface';
import { IUseCase } from '@common/interfaces/use-case.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITokenAuth } from '@modules/auth/domain/ports/auth-provider.port';
import { TOKEN_AUTH } from '@modules/auth/domain/ports/auth-provider.tokens';
import { AuthUser } from '@modules/auth/domain/types/auth-user.type';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class VerifyTokenUsecase implements IUseCase<string, AuthUser, Error> {
	constructor(
		@Inject(TOKEN_AUTH) private readonly tokenAuth: ITokenAuth,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(VerifyTokenUsecase.name);
	}

	async execute(token: string): Promise<Result<AuthUser, Error>> {
		try {
			this.logger.debug('Verifying JWT token');
			const claims = await this.tokenAuth.verifyJWT(token);

			this.logger.debug('Successfully verified JWT token');
			return ok(this.tokenAuth.toAuthUser(claims));
		} catch (error) {
			this.logger.error('Failed to verify JWT token');
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}
}
