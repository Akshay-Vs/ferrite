import { IUseCase } from '@common/interfaces/use-case.interface';
import { StorefrontUserLogin } from '@ferrite/schema/storefront-auth/login.zodschema';
import { StorefrontUserResponse } from '@ferrite/schema/storefront-auth/storefront-user.zodschema';
import { IncompleteConfigurationError } from '@store/domain/errors/incomplete-configuration.error';
export const STOREFRONT_LOGIN_UC = Symbol('STOREFRONT_LOGIN_UC');

export type IStorefrontLoginUser = IUseCase<
	StorefrontUserLogin,
	StorefrontUserResponse,
	IncompleteConfigurationError | Error
>;
