import { IUseCase } from '@common/interfaces/use-case.interface';
import { AuthUser } from '@ferrite/schema/auth/auth-user.zodschema';

export const JWT_TOKEN_UC = Symbol('JWT_TOKEN_UC');

/**
 * Verifies the JWT token and transforms the raw claims into an AuthUser.
 * @param token - The raw JWT string from the Authorization header
 * @returns A Result containing either an AuthUser or an error
 */
export type IJwtTokenUseCase = IUseCase<string, AuthUser, Error>;
