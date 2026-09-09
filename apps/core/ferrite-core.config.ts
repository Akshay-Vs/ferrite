import type {
	DeepPartial,
	FerriteConfig,
} from './src/core/config/ferrite.schema';

// Default application configuration.
// Note: Environment variables (.env or process.env) take priority and will override values set here.

const config: DeepPartial<FerriteConfig> = {
	version: 'v1',
	port: 4000,
	origin: ['http://localhost:3000'],
	observability: {
		instrumentation: true,
		tracer: true,
		logger: {
			loki: true,
			tty: true,
		},
	},
	storefrontAuth: {
		argon2: {
			memoryCost: 19456,
			timeCost: 2,
			parallelism: 1,
			outputLen: 32,
			saltLen: 16,
		},
		redis: {
			db: 0,
			tls: false,
		},
		rateLimiting: {
			login: {
				windowMs: 900000,
				maxAttempts: 5,
			},
			loginIp: {
				windowMs: 900000,
				maxAttempts: 20,
			},
			registerIp: {
				windowMs: 3600000,
				maxAttempts: 10,
			},
			passwordReset: {
				windowMs: 3600000,
				maxAttempts: 3,
			},
			verifyEmail: {
				windowMs: 60000,
				maxAttempts: 10,
			},
			mfaVerify: {
				windowMs: 900000,
				maxAttempts: 5,
			},
			resendCooldownMs: 60000,
		},
		session: {
			idleLifetimeMs: 604800000,
			absoluteLifetimeMs: 2592000000,
			renewalThreshold: 0.5,
			cookieName: '__Host-session-token',
			sessionLimit: 10,
		},
		csrf: {
			maxAge: 604800,
			cookieName: '__Host-csrf-token',
		},
		security: {
			pathPrefix: '/stores/:storeId',
			lockoutThreshold: 5,
			lockoutDurationMs: 900000,
			passwordResetTokenTtlMs: 3600000,
		},
	},
};

export default config;
