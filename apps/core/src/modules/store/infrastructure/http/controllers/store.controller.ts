import { Controller, Get } from '@nestjs/common';

@Controller('stores')
export class StoreController {
	constructor() {}

	@Get()
	getStores() {
		return 'Hello World';
	}
}
