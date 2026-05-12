import type { PermissionKey } from '@ferrite/schema/common/permissions.zodschema';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = Symbol('PERMISSIONS_KEY');

export const RequirePermission = (...permissions: PermissionKey[]) =>
	SetMetadata(PERMISSIONS_KEY, permissions);
