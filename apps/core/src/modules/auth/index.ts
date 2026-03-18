// auth/index.ts

export type {
	ITokenAuth,
	IWebhookAuth,
} from './domain/ports/auth-provider.port';
export {
	TOKEN_AUTH,
	WEBHOOK_AUTH,
} from './domain/ports/auth-provider.tokens';
export {
	type AuthProvider,
	authProvidersEnum,
	authProvidersSchema,
} from './domain/schemas/auth-providers.zodschema';
export {
	type AuthUser,
	authUserSchema,
} from './domain/schemas/auth-user.zodschema';
export {
	type RawTokenClaims,
	rawTokenClaimsSchema,
} from './domain/schemas/token-claims.zodschema';
export {
	type WebhookPayload,
	webhookPayloadSchema,
} from './domain/schemas/webhook-claims.zodschema';
export { AuthUserParam } from './infrastructure/http/decorators/auth-user.decorator';
export { PublicRoute } from './infrastructure/http/decorators/public-route.decorator';
export { WebhookRoute } from './infrastructure/http/decorators/webhook-route.decorator';
export { AuthGuard } from './infrastructure/http/guards/auth.guard';
export { WebhookGuard } from './infrastructure/http/guards/webhook.guard';
