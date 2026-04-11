import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = Symbol('ROLES_KEY');

export const RequireRole = (...roles: string[]) =>
	SetMetadata(ROLES_KEY, roles);
