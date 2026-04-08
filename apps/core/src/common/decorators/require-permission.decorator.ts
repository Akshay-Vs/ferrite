import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = Symbol('PERMISSIONS_KEY');

export const RequirePermission = (...permissions: string[]) =>
	SetMetadata(PERMISSIONS_KEY, permissions);
