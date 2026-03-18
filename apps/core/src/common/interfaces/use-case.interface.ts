import { Result } from './result.interface';

/**
 * Represents an application use case.
 *
 * A use case encapsulates a single unit of application logic. It receives an
 * input DTO and produces either a successful output value or a domain error.
 *
 * Execution is asynchronous and the outcome is represented using a `Result`
 * type rather than exceptions. Implementations should encode expected
 * failures as `Err` values instead of throwing.
 *
 * Generic parameters:
 * - `TInput`  — Input data required to execute the use case.
 * - `TOutput` — Successful result produced by the use case.
 * - `TError`  — Error type returned when the use case fails.
 *
 * Contract:
 * - Accepts immutable input data.
 * - Returns a `Result` describing success (`Ok`) or failure (`Err`).
 * - Domain failures must be returned as `Err`, not thrown.
 * - Exceptions should be reserved for unexpected or unrecoverable conditions.
 */
export interface IUseCase<
	TInput = void,
	TOutput = void,
	TError extends Error = Error,
> {
	/**
	 * Executes the use case.
	 *
	 * @param input Input data required for execution.
	 * @returns A promise resolving to:
	 * - `Ok<TOutput>` when the use case succeeds
	 * - `Err<TError>` when the use case fails
	 */
	execute(
		input: TInput
	): Promise<Result<TOutput, TError>> | Result<TOutput, TError>;
}
