import type { Login } from '@ferrite/schema/storefront-auth/login.zodschema';
export const STOREFRONT_LOGIN_UC = Symbol('STOREFRONT_LOGIN_UC');

export interface ILogin {
	execute(props: Login): Promise<boolean>;
}
