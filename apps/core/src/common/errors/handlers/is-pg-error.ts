import { DatabaseError } from 'pg';

/** Narrows an unknown thrown value to pg's DatabaseError */
export function isPgError(err: unknown): err is DatabaseError {
	return err instanceof DatabaseError;
}
