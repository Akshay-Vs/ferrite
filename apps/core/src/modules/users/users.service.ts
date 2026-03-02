import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DB } from 'src/database/db.provider';
import type { PsqlDB } from 'src/database/db.type';
import { usersTable } from 'src/database/schema';

@Injectable()
export class UsersService {
	constructor(@Inject(DB) private readonly db: PsqlDB) {}

	private usersTable() {
		return this.db.select().from(usersTable);
	}

	async findAll() {
		return await this.usersTable().limit(100);
	}

	async findOne(id: string) {
		return await this.usersTable().where(eq(usersTable.id, id));
	}
}
