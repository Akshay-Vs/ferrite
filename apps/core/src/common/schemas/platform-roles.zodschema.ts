import { z } from 'zod';

// Define the roles as a constant for IntelliSense
export const PlatformRoles = {
	ADMIN: 'admin',
	STAFF: 'staff',
	USER: 'user',
} as const;

// Derive the type and schema from the constant
export type PlatformRole = (typeof PlatformRoles)[keyof typeof PlatformRoles];

export const platformRoleSchema = z.enum(PlatformRoles);

// Define the role hierarchy
export const ROLE_HIERARCHY: Record<PlatformRole, number> = {
	[PlatformRoles.ADMIN]: 3,
	[PlatformRoles.STAFF]: 2,
	[PlatformRoles.USER]: 1,
};
