export const STOREFRONT_PASSWORD_HASHER = Symbol('STOREFRONT_PASSWORD_HASHER');

export interface IStorefrontPasswordHasher {
	hash(password: string): Promise<string>;
	isValid(password: string, hashedPassword: string): Promise<boolean>;
}
