import { AuthUser } from '@modules/auth/domain/types/auth-user.type';
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
	authUser: AuthUser;
}
