import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	async findAll() {
		return this.usersService.findAll();
	}

	async findOne(id: string) {
		return this.usersService.findOne(id);
	}
}
