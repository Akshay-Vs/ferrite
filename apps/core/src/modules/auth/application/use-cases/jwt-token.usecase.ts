import { IJwtTokenUseCase } from '@auth/domain/ports/use-case.port';
import { err, ok, Result } from '@common/interfaces/result.interface';
import { AppLogger } from '@core/logger/logger.service';
import { type ITracer, OTEL_TRACER } from '@core/tracer';
import { AuthUser } from '@ferrite/schema/auth/index';
import { type ITokenAuth } from '@modules/auth/domain/ports/auth-provider.port';
import { TOKEN_AUTH } from '@modules/auth/domain/ports/auth-provider.tokens';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class JwtTokenUseCase implements IJwtTokenUseCase {
	constructor(
		@Inject(TOKEN_AUTH) private readonly tokenAuth: ITokenAuth,
		@Inject(OTEL_TRACER) private readonly tracer: ITracer,
		private readonly logger: AppLogger
	) {
		this.logger.setContext(JwtTokenUseCase.name);
	}

	async execute(token: string): Promise<Result<AuthUser, Error>> {
		return await this.tracer.withSpan('use-case.jwt-token', async () => {
			try {
				this.logger.debug('Verifying JWT token');
				const result = await this.tokenAuth.verifyJWT(token);

				if (result.isErr()) {
					this.logger.error('Failed to verify JWT token', result.error.stack);
					return err(result.error);
				}

				this.logger.debug('Successfully verified JWT token');
				return ok(this.tokenAuth.toAuthUser(result.unwrap()));
			} catch (caught: unknown) {
				const normalized =
					caught instanceof Error ? caught : new Error(String(caught));
				this.logger.error('Failed to verify JWT token', normalized.stack);
				return err(normalized);
			}
			}
		});
	}
}
