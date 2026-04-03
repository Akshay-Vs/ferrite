import { DatabaseError } from 'pg';
import { isPgError } from './is-pg-error';

const PG_UNIQUE_VIOLATION = '23505' as const;

/**
 * Drizzle wraps the raw pg error, so check both the top-level error
 * and its cause for the unique-violation code + our specific constraint.
 */
export function isUniqueConstrainViolation(err: unknown): boolean {
	const pgErr = isPgError(err)
		? err
		: isPgError((err as { cause?: unknown })?.cause)
			? (err as { cause: DatabaseError }).cause
			: null;

	return (
		pgErr?.code === PG_UNIQUE_VIOLATION &&
		pgErr?.constraint === 'uq_inbox_provider_event_id'
	);
}
