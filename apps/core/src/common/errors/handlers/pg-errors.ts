import { pgErrorCode, pgErrorInfo } from './pg-error-code';

// Constraints
const PG_NOT_NULL_VIOLATION = '23502' as const;
const PG_FK_VIOLATION = '23503' as const;
const PG_UNIQUE_VIOLATION = '23505' as const;
const PG_CHECK_VIOLATION = '23514' as const;
const PG_EXCLUSION_VIOLATION = '23P01' as const;
const PG_SERIALIZATION_FAILURE = '40001' as const;
const PG_DEADLOCK_DETECTED = '40P01' as const;
const PG_UNDEFINED_TABLE = '42P01' as const;
const PG_UNDEFINED_COLUMN = '42703' as const;
const PG_INSUFFICIENT_PRIVILEGE = '42501' as const;
const PG_TOO_MANY_CONNECTIONS = '53300' as const;
const PG_LOCK_NOT_AVAILABLE = '55P03' as const;
const PG_QUERY_CANCELED = '57014' as const;
const PG_CONNECTION_EXCEPTION = '08000' as const;
const PG_CONNECTION_DOES_NOT_EXIST = '08003' as const;
const PG_CONNECTION_FAILURE = '08006' as const;
const PG_READ_ONLY_SQL_TRANSACTION = '25006' as const;

// Heuristic matchers

/** Strings PG puts in message/detail for FK violations when code isn't surfaced. */
const FK_MESSAGE_HINTS = ['foreign key constraint'] as const;
const FK_DETAIL_HINTS = [
	'is still referenced',
	'foreign key constraint',
] as const;

// Checkers

/**
 * 23503 — Foreign-key constraint violated.
 *
 * Falls back to message/detail heuristics when the SQLSTATE code is missing
 * (e.g. some ORM wrappers that don't forward `.code` reliably).
 */
export function isFkViolation(err: unknown): boolean {
	const { code, message, detail } = pgErrorInfo(err);

	// Only fall back to heuristics when the driver did not surface a SQLSTATE code.
	return (
		code === PG_FK_VIOLATION ||
		(!code &&
			(FK_MESSAGE_HINTS.some((h) => message.includes(h)) ||
				FK_DETAIL_HINTS.some((h) => detail.includes(h))))
	);
}

/** 23502 — NOT NULL constraint violated. */
export function isNotNullViolation(err: unknown): boolean {
	return pgErrorCode(err) === PG_NOT_NULL_VIOLATION;
}

/** 23505 — Unique / primary-key constraint violated. */
export function isUniqueViolation(err: unknown): boolean {
	return pgErrorCode(err) === PG_UNIQUE_VIOLATION;
}

/** 23514 — CHECK constraint violated. */
export function isCheckViolation(err: unknown): boolean {
	return pgErrorCode(err) === PG_CHECK_VIOLATION;
}

/** 23P01 — Exclusion constraint violated. */
export function isExclusionViolation(err: unknown): boolean {
	return pgErrorCode(err) === PG_EXCLUSION_VIOLATION;
}

/** True for any Class 23 integrity-constraint violation. */
export function isIntegrityViolation(err: unknown): boolean {
	return pgErrorCode(err)?.startsWith('23') ?? false;
}

/** 40001 — Transaction must be retried (serialization anomaly). */
export function isSerializationFailure(err: unknown): boolean {
	return pgErrorCode(err) === PG_SERIALIZATION_FAILURE;
}

/** 40P01 — Deadlock detected. */
export function isDeadlock(err: unknown): boolean {
	return pgErrorCode(err) === PG_DEADLOCK_DETECTED;
}

/** True when the error warrants a retry (serialization failure or deadlock). */
export function isRetryable(err: unknown): boolean {
	const code = pgErrorCode(err);
	return code === PG_SERIALIZATION_FAILURE || code === PG_DEADLOCK_DETECTED;
}

/** 42P01 — Referenced table does not exist. */
export function isUndefinedTable(err: unknown): boolean {
	return pgErrorCode(err) === PG_UNDEFINED_TABLE;
}

/** 42703 — Referenced column does not exist. */
export function isUndefinedColumn(err: unknown): boolean {
	return pgErrorCode(err) === PG_UNDEFINED_COLUMN;
}

/** 42501 — Current role lacks required privilege. */
export function isInsufficientPrivilege(err: unknown): boolean {
	return pgErrorCode(err) === PG_INSUFFICIENT_PRIVILEGE;
}

/** 53300 — Server has reached its connection limit. */
export function isTooManyConnections(err: unknown): boolean {
	return pgErrorCode(err) === PG_TOO_MANY_CONNECTIONS;
}

/** 55P03 — NOWAIT lock could not be acquired. */
export function isLockNotAvailable(err: unknown): boolean {
	return pgErrorCode(err) === PG_LOCK_NOT_AVAILABLE;
}

/** 57014 — Query was cancelled (e.g. statement_timeout). */
export function isQueryCanceled(err: unknown): boolean {
	return pgErrorCode(err) === PG_QUERY_CANCELED;
}

/** True for any connection-level error (Class 08). */
export function isConnectionError(err: unknown): boolean {
	const code = pgErrorCode(err);
	return (
		code === PG_CONNECTION_EXCEPTION ||
		code === PG_CONNECTION_DOES_NOT_EXIST ||
		code === PG_CONNECTION_FAILURE
	);
}

/** 25006 — Write attempted inside a read-only transaction. */
export function isReadOnlyTransaction(err: unknown): boolean {
	return pgErrorCode(err) === PG_READ_ONLY_SQL_TRANSACTION;
}
