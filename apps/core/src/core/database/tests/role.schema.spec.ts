import { eq } from 'drizzle-orm';
import {
	permissions,
	rolePermissions,
	roles,
	staffMembers,
	staffPermissionOverrides,
} from '../schema/role.schema';
import { users } from '../schema/user.schema';
import {
	createTestPermission,
	createTestRole,
	createTestRolePermission,
	createTestStaffMember,
	createTestStaffPermissionOverride,
	createTestUser,
} from './helpers';
import { cleanupTables, db, setupTestDB, teardownTestDB } from './setup';

beforeAll(async () => {
	await setupTestDB();
});

afterAll(async () => {
	await teardownTestDB();
});

beforeEach(async () => {
	await cleanupTables();
});

describe('RBAC tables', () => {
	describe('roles table', () => {
		it('should insert a role', async () => {
			const [role] = await db
				.insert(roles)
				.values(createTestRole())
				.returning();
			expect(role.id).toBeDefined();
			expect(role.name).toMatch(/Test Role/);
			expect(role.isSystem).toBe(false);
		});

		it('should enforce unique role name', async () => {
			await db.insert(roles).values(createTestRole({ name: 'UniqueRoleName' }));
			try {
				await db
					.insert(roles)
					.values(createTestRole({ name: 'UniqueRoleName' }));
				throw new Error('Should have thrown on duplicate role name');
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});
	});

	describe('permissions table', () => {
		it('should insert a permission', async () => {
			const [perm] = await db
				.insert(permissions)
				.values(createTestPermission({ resource: 'orders', action: 'read' }))
				.returning();

			expect(perm.id).toBeDefined();
			expect(perm.resource).toBe('orders');
			expect(perm.action).toBe('read');
		});

		it('should enforce unique permission resource + action', async () => {
			await db
				.insert(permissions)
				.values(
					createTestPermission({ resource: 'products', action: 'create' })
				);

			try {
				await db
					.insert(permissions)
					.values(
						createTestPermission({ resource: 'products', action: 'create' })
					);
				throw new Error(
					'Should have thrown on duplicate permission resource+action'
				);
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});
	});

	describe('role_permissions table', () => {
		it('should assign a permission to a role', async () => {
			const [role] = await db
				.insert(roles)
				.values(createTestRole())
				.returning();
			const [perm] = await db
				.insert(permissions)
				.values(createTestPermission({ resource: 'orders', action: 'read' }))
				.returning();

			const [rolePerm] = await db
				.insert(rolePermissions)
				.values(createTestRolePermission(role.id, perm.id))
				.returning();

			expect(rolePerm.roleId).toBe(role.id);
			expect(rolePerm.permissionId).toBe(perm.id);
		});

		it('should cascade delete when role is deleted', async () => {
			const [role] = await db
				.insert(roles)
				.values(createTestRole())
				.returning();
			const [perm] = await db
				.insert(permissions)
				.values(createTestPermission({ resource: 'orders', action: 'read' }))
				.returning();

			await db
				.insert(rolePermissions)
				.values(createTestRolePermission(role.id, perm.id));

			await db.delete(roles).where(eq(roles.id, role.id));

			const rows = await db
				.select()
				.from(rolePermissions)
				.where(eq(rolePermissions.roleId, role.id));

			expect(rows).toHaveLength(0);
		});
	});

	describe('staff_members table', () => {
		it('should insert a staff member', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [role] = await db
				.insert(roles)
				.values(createTestRole())
				.returning();

			const [staff] = await db
				.insert(staffMembers)
				.values(createTestStaffMember(user.id, role.id))
				.returning();

			expect(staff.userId).toBe(user.id);
			expect(staff.roleId).toBe(role.id);
			expect(staff.status).toBe('active');
		});

		it('should enforce exactly one owner via unique partial index', async () => {
			const [user1] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [user2] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [role] = await db
				.insert(roles)
				.values(createTestRole())
				.returning();

			await db
				.insert(staffMembers)
				.values(createTestStaffMember(user1.id, role.id, { isOwner: true }));

			try {
				await db
					.insert(staffMembers)
					.values(createTestStaffMember(user2.id, role.id, { isOwner: true }));
				throw new Error('Should have thrown on multiple owners');
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});
	});

	describe('staff_permission_overrides table', () => {
		it('should insert a staff permission override', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [adminUser] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [role] = await db
				.insert(roles)
				.values(createTestRole())
				.returning();

			const [staff] = await db
				.insert(staffMembers)
				.values(createTestStaffMember(user.id, role.id))
				.returning();
			const [adminStaff] = await db
				.insert(staffMembers)
				.values(createTestStaffMember(adminUser.id, role.id))
				.returning();

			const [perm] = await db
				.insert(permissions)
				.values(createTestPermission({ resource: 'orders', action: 'read' }))
				.returning();

			const [override] = await db
				.insert(staffPermissionOverrides)
				.values(
					createTestStaffPermissionOverride(staff.id, perm.id, adminStaff.id, {
						type: 'revoke',
					})
				)
				.returning();

			expect(override.staffId).toBe(staff.id);
			expect(override.permissionId).toBe(perm.id);
			expect(override.type).toBe('revoke');
			expect(override.overriddenBy).toBe(adminStaff.id);
		});

		it('should enforce unique staff + permission override', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [adminUser] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [role] = await db
				.insert(roles)
				.values(createTestRole())
				.returning();

			const [staff] = await db
				.insert(staffMembers)
				.values(createTestStaffMember(user.id, role.id))
				.returning();
			const [adminStaff] = await db
				.insert(staffMembers)
				.values(createTestStaffMember(adminUser.id, role.id))
				.returning();

			const [perm] = await db
				.insert(permissions)
				.values(createTestPermission({ resource: 'orders', action: 'read' }))
				.returning();

			await db.insert(staffPermissionOverrides).values(
				createTestStaffPermissionOverride(staff.id, perm.id, adminStaff.id, {
					type: 'revoke',
				})
			);

			try {
				await db
					.insert(staffPermissionOverrides)
					.values(
						createTestStaffPermissionOverride(
							staff.id,
							perm.id,
							adminStaff.id,
							{ type: 'grant' }
						)
					);
				throw new Error(
					'Should have thrown on duplicate override for same staff+permission'
				);
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});
	});
});
