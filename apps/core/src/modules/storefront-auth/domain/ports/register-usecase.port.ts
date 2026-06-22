import { IUseCase } from '@common/interfaces/use-case.interface';
import type { StorefrontUserRegister } from '@ferrite/schema/storefront-auth/register.zodschema';
import type { StorefrontUserResponse } from '@ferrite/schema/storefront-auth/storefront-user.zodschema';

export const STOREFRONT_REGISTER_UC = Symbol('STOREFRONT_REGISTER_UC');

export type IStorefrontRegisterUser = IUseCase<
	StorefrontUserRegister & { storeId: string },
	StorefrontUserResponse,
	Error
>;
