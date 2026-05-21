export class RoleHasMembersError extends Error {
	readonly _tag = 'RoleHasMembersError';

	constructor(roleId: string) {
		super(`Cannot delete role ${roleId}: role still has active members`);
	}
}
