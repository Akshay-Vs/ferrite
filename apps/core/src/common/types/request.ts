import { AuthUser } from '@auth/domain/schemas';
import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
	authUser: AuthUser;
}
