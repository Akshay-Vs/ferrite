import { DB } from '@core/database/db.provider';
import { type PsqlDB } from '@core/database/db.type';
import { users } from '@core/database/schema';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
	constructor(@Inject(DB) private readonly db: PsqlDB) {}

	private usersTable() {
		return this.db.select().from(users);
	}

	async findAll() {
		return await this.usersTable().limit(100);
	}

	async findOne(id: string) {
		return await this.usersTable().where(eq(users.id, id));
	}
}
