import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from '../schemas/permissions.zodschema';

export const PERMISSIONS_KEY = Symbol('PERMISSIONS_KEY');

export const RequirePermission = (...permissions: PermissionKey[]) =>
	SetMetadata(PERMISSIONS_KEY, permissions);
