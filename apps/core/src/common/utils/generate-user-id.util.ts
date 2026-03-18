import { validate as isUuid, v5 as uuidv5 } from 'uuid';

export type GenerateUserId = (externalId: string) => string;

export function createUserIdGenerator(privateKey: string): GenerateUserId {
	if (!isUuid(privateKey)) {
		throw new Error('Invalid private key');
	}

	return (externalId: string) => uuidv5(externalId, privateKey);
}
