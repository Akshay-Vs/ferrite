import { PublicRoute } from '@common/decorators/public-route.decorator';
import { STOREFRONT_LOGIN_UC } from '@modules/storefront-auth/domain/ports/login-usecase.port';
import type { IStorefrontRegisterUser } from '@modules/storefront-auth/domain/ports/register-usecase.port';
import { STOREFRONT_REGISTER_UC } from '@modules/storefront-auth/domain/ports/register-usecase.port';
import {
	Body,
	Controller,
	Inject,
	Param,
	Post,
	UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDocs } from '../docs/storefront-auth.docs';
import { RegisterInputDTO } from '../dto/register.dto';

@ApiTags('Storefront Auth')
@Controller(':storeId/storefront-auth')
export class StorefrontAuthController {
	constructor(
		@Inject(STOREFRONT_LOGIN_UC)
		@Inject(STOREFRONT_REGISTER_UC)
		private readonly registerUseCase: IStorefrontRegisterUser
	) {}

	@Post('register')
	@RegisterUserDocs()
	@PublicRoute()
	async register(
		@Param('storeId') storeId: string,
		@Body() payload: RegisterInputDTO
	) {
		const result = await this.registerUseCase.execute({
			...payload,
			storeId,
		});

		if (result.isErr()) {
			throw new UnprocessableEntityException(result.error.message);
		}

		return result.value;
	}
}
