export * from './api-transport.error';
export * from './auth-session.error';
export * from './contract-violation.error';

import type { ApiTransportError } from './api-transport.error';
import type { AuthSessionError } from './auth-session.error';
import type { ContractViolationError } from './contract-violation.error';

export type FerriteApiError =
	| ApiTransportError
	| ContractViolationError
	| AuthSessionError;
