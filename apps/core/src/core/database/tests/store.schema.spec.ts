import { eq } from 'drizzle-orm';
import { permissions } from '../schema/permission.schema';
import {
	storeMembers,
	storeRolePermissions,
	storeRoles,
	stores,
} from '../schema/store.schema';
import { users } from '../schema/user.schema';
import {
	createTestPermission,
	createTestStore,
	createTestStoreMember,
	createTestStoreRole,
	createTestStoreRolePermission,
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

describe('Store tables', () => {
	describe('stores table', () => {
		it('should insert a store', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();

			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();

			expect(store.id).toBeDefined();
			expect(store.name).toMatch(/Test Store/);
			expect(store.slug).toMatch(/test-store/);
			expect(store.createdBy).toBe(user.id);
			expect(store.isActive).toBe(true);
			expect(store.deletedAt).toBeNull();
		});

		it('should enforce unique slug', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();

			await db
				.insert(stores)
				.values(createTestStore(user.id, { slug: 'unique-slug' }));

			try {
				await db
					.insert(stores)
					.values(createTestStore(user.id, { slug: 'unique-slug' }));
				throw new Error('Should have thrown on duplicate slug');
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});

		it('should support soft delete via deletedAt', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();

			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();

			const now = new Date();
			const [softDeleted] = await db
				.update(stores)
				.set({ deletedAt: now })
				.where(eq(stores.id, store.id))
				.returning();

			expect(softDeleted.deletedAt).toEqual(now);
		});

		it('should store metadata as jsonb', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();

			const meta = { theme: 'dark', features: ['chat', 'analytics'] };
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id, { metadata: meta }))
				.returning();

			expect(store.metadata).toEqual(meta);
		});
	});

	describe('store_roles table', () => {
		it('should insert a store role', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();

			const [role] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Admin' }))
				.returning();

			expect(role.storeId).toBe(store.id);
			expect(role.name).toBe('Admin');
			expect(role.isSystem).toBe(false);
		});

		it('should enforce unique (store_id, name)', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();

			await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Moderator' }));

			try {
				await db
					.insert(storeRoles)
					.values(createTestStoreRole(store.id, { name: 'Moderator' }));
				throw new Error(
					'Should have thrown on duplicate role name in same store'
				);
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});

		it('should allow same role name across different stores', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store1] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [store2] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();

			await db
				.insert(storeRoles)
				.values(createTestStoreRole(store1.id, { name: 'Moderator' }));

			const [role2] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store2.id, { name: 'Moderator' }))
				.returning();

			expect(role2.name).toBe('Moderator');
		});

		it('should cascade delete roles when store is deleted', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();

			await db.insert(storeRoles).values(createTestStoreRole(store.id));

			await db.delete(stores).where(eq(stores.id, store.id));

			const rows = await db
				.select()
				.from(storeRoles)
				.where(eq(storeRoles.storeId, store.id));

			expect(rows).toHaveLength(0);
		});
	});

	describe('store_role_permissions table', () => {
		it('should assign a permission to a store role', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [role] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Editor' }))
				.returning();
			const [perm] = await db
				.insert(permissions)
				.values(
					createTestPermission({
						resource: 'products',
						action: 'create',
					})
				)
				.returning();

			const [rp] = await db
				.insert(storeRolePermissions)
				.values(createTestStoreRolePermission(role.id, perm.id))
				.returning();

			expect(rp.storeRoleId).toBe(role.id);
			expect(rp.permissionId).toBe(perm.id);
		});

		it('should cascade delete permissions when store role is deleted', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [role] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Editor' }))
				.returning();
			const [perm] = await db
				.insert(permissions)
				.values(
					createTestPermission({
						resource: 'orders',
						action: 'read',
					})
				)
				.returning();

			await db
				.insert(storeRolePermissions)
				.values(createTestStoreRolePermission(role.id, perm.id));

			await db.delete(storeRoles).where(eq(storeRoles.id, role.id));

			const rows = await db
				.select()
				.from(storeRolePermissions)
				.where(eq(storeRolePermissions.storeRoleId, role.id));

			expect(rows).toHaveLength(0);
		});
	});

	describe('store_members table', () => {
		it('should insert a store member with a role', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [role] = await db
				.insert(storeRoles)
				.values(
					createTestStoreRole(store.id, {
						name: 'Admin',
						isSystem: true,
					})
				)
				.returning();

			const [member] = await db
				.insert(storeMembers)
				.values(
					createTestStoreMember(store.id, user.id, role.id, {
						isOwner: true,
					})
				)
				.returning();

			expect(member.storeId).toBe(store.id);
			expect(member.userId).toBe(user.id);
			expect(member.roleId).toBe(role.id);
			expect(member.isOwner).toBe(true);
		});

		it('should enforce unique (store_id, user_id)', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [role] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Admin' }))
				.returning();

			await db
				.insert(storeMembers)
				.values(createTestStoreMember(store.id, user.id, role.id));

			try {
				await db
					.insert(storeMembers)
					.values(createTestStoreMember(store.id, user.id, role.id));
				throw new Error('Should have thrown on duplicate store_id + user_id');
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});

		it('should enforce exactly one owner per store', async () => {
			const [user1] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [user2] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user1.id))
				.returning();
			const [role] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Admin' }))
				.returning();

			await db.insert(storeMembers).values(
				createTestStoreMember(store.id, user1.id, role.id, {
					isOwner: true,
				})
			);

			try {
				await db.insert(storeMembers).values(
					createTestStoreMember(store.id, user2.id, role.id, {
						isOwner: true,
					})
				);
				throw new Error('Should have thrown on multiple owners');
			} catch (e: any) {
				expect(e.cause?.code).toBe('23505');
			}
		});

		it('should allow owners across different stores', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store1] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [store2] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [role1] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store1.id, { name: 'Admin' }))
				.returning();
			const [role2] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store2.id, { name: 'Admin' }))
				.returning();

			await db.insert(storeMembers).values(
				createTestStoreMember(store1.id, user.id, role1.id, {
					isOwner: true,
				})
			);
			const [member2] = await db
				.insert(storeMembers)
				.values(
					createTestStoreMember(store2.id, user.id, role2.id, {
						isOwner: true,
					})
				)
				.returning();

			expect(member2.isOwner).toBe(true);
		});

		it('should cascade delete members when store is deleted', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [role] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Admin' }))
				.returning();

			await db
				.insert(storeMembers)
				.values(createTestStoreMember(store.id, user.id, role.id));

			await db.delete(stores).where(eq(stores.id, store.id));

			const rows = await db
				.select()
				.from(storeMembers)
				.where(eq(storeMembers.storeId, store.id));

			expect(rows).toHaveLength(0);
		});

		it('should prevent deleting a role that has members assigned', async () => {
			const [user] = await db
				.insert(users)
				.values(createTestUser())
				.returning();
			const [store] = await db
				.insert(stores)
				.values(createTestStore(user.id))
				.returning();
			const [role] = await db
				.insert(storeRoles)
				.values(createTestStoreRole(store.id, { name: 'Admin' }))
				.returning();

			await db
				.insert(storeMembers)
				.values(createTestStoreMember(store.id, user.id, role.id));

			try {
				await db.delete(storeRoles).where(eq(storeRoles.id, role.id));
				throw new Error(
					'Should have thrown on deleting role with active members'
				);
			} catch (e: any) {
				// 23503 = foreign key violation
				expect(e.cause?.code).toBe('23503');
			}
		});
	});
});
