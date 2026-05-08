import { DatabaseError } from 'pg';

export interface PgErrorInfo {
	code: string | undefined;
	message: string;
	detail: string;
}

function fromDatabaseError(err: DatabaseError): PgErrorInfo {
	return {
		code: err.code,
		message: err.message.toLowerCase(),
		detail: (err.detail ?? '').toLowerCase(),
	};
}

function merge(a: PgErrorInfo, b: PgErrorInfo): PgErrorInfo {
	return {
		code: a.code ?? b.code,
		message: [a.message, b.message].filter(Boolean).join(' '),
		detail: [a.detail, b.detail].filter(Boolean).join(' '),
	};
}

/**
 * Extracts PG error info from an unknown thrown value.
 * Handles raw `pg` DatabaseError, Drizzle-wrapped errors (`.cause`),
 * and duck-typed objects that forward `.code` / `.message` / `.detail`.
 */
export function pgErrorInfo(err: unknown): PgErrorInfo {
	// Raw pg DatabaseError
	if (err instanceof DatabaseError) {
		return fromDatabaseError(err);
	}

	if (err instanceof Error) {
		const base: PgErrorInfo = {
			code: (err as any).code,
			message: err.message.toLowerCase(),
			detail: ((err as any).detail ?? '').toLowerCase(),
		};

		// Drizzle wraps the original DatabaseError in `.cause`
		if (err.cause instanceof DatabaseError) {
			return merge(base, fromDatabaseError(err.cause));
		}

		// Generic cause that may carry a code / detail (other ORMs, custom wrappers)
		if (err.cause && typeof err.cause === 'object') {
			const cause = err.cause as Record<string, unknown>;
			const causeInfo: PgErrorInfo = {
				code: typeof cause.code === 'string' ? cause.code : undefined,
				message:
					typeof cause.message === 'string' ? cause.message.toLowerCase() : '',
				detail:
					typeof cause.detail === 'string' ? cause.detail.toLowerCase() : '',
			};
			return merge(base, causeInfo);
		}

		return base;
	}

	// Duck-typed non-Error object
	if (typeof err === 'object' && err !== null) {
		const e = err as Record<string, unknown>;
		return {
			code: typeof e.code === 'string' ? e.code : undefined,
			message: typeof e.message === 'string' ? e.message.toLowerCase() : '',
			detail: typeof e.detail === 'string' ? e.detail.toLowerCase() : '',
		};
	}

	return { code: undefined, message: '', detail: '' };
}

/**
 * Convenience wrapper — returns just the SQLSTATE code.
 * Use `pgErrorInfo` when you also need message/detail heuristics.
 */
export function pgErrorCode(err: unknown): string | undefined {
	return pgErrorInfo(err).code;
}
