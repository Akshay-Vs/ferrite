export type Result<T, E extends Error = Error> = Ok<T, E> | Err<T, E>;

export class Ok<T, E extends Error = Error> {
	readonly ok = true as const;
	readonly error = undefined;

	constructor(readonly value: T) {}

	isOk(): this is Ok<T, E> {
		return true;
	}
	isErr(): this is Err<T, E> {
		return false;
	}

	map<U>(fn: (value: T) => U): Ok<U, E> {
		return new Ok(fn(this.value));
	}

	mapErr<F extends Error>(_fn: (error: never) => F): Ok<T, F> {
		return new Ok(this.value);
	}

	unwrap(): T {
		return this.value;
	}
	unwrapOr(_fallback: T): T {
		return this.value;
	}
}

//  Err

export class Err<T, E extends Error = Error> {
	readonly ok = false as const;
	readonly value = undefined;

	constructor(readonly error: E) {}

	isOk(): this is Ok<T, E> {
		return false;
	}
	isErr(): this is Err<T, E> {
		return true;
	}

	map<U>(_fn: (value: never) => U): Err<U, E> {
		return new Err(this.error);
	}

	mapErr<F extends Error>(fn: (error: E) => F): Err<T, F> {
		return new Err(fn(this.error));
	}

	unwrap(): never {
		throw new Error(`Called unwrap() on Err: ${this.error.message}`);
	}

	unwrapOr(fallback: T): T {
		return fallback;
	}
}

//  Constructors

export const ok = <T, E extends Error = Error>(value: T): Ok<T, E> =>
	new Ok(value);
export const err = <T, E extends Error = Error>(error: E): Err<T, E> =>
	new Err(error);
