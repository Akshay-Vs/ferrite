import { v5 as uuidv5 } from 'uuid';

export type GenerateUserId = (externalId: string) => string;

export function createUserIdGenerator(privateKey: string): GenerateUserId {
	return (externalId: string) => uuidv5(externalId, privateKey);
}
