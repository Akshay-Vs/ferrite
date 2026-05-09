import type { AxiosRequestConfig } from 'axios';
import type { ZodType, z } from 'zod/v4';

export interface RequestConfig<
	TResponseSchema extends ZodType,
	TPayloadSchema extends ZodType | undefined = undefined,
> extends Omit<AxiosRequestConfig, 'data'> {
	/** Zod schema to validate the response data */
	responseSchema: TResponseSchema;

	/** Optional Zod schema to validate the request payload before sending */
	payloadSchema?: TPayloadSchema;

	/** The payload data to send. Must match the payload schema if provided. */
	data?: PayloadData<TPayloadSchema>;
}

/**
 * Shared options for HTTP requests, excluding properties managed explicitly by the client.
 */
export type HttpRequestOptions = Omit<
	AxiosRequestConfig,
	'url' | 'method' | 'data'
>;

/** Helper type for inferring the input type of a Zod payload schema */
export type PayloadData<TPayloadSchema extends ZodType | undefined> =
	TPayloadSchema extends ZodType ? z.input<TPayloadSchema> : unknown;

/** Helper type for inferring the output Promise of a Zod response schema */
export type ApiResponse<TResponseSchema extends ZodType> = Promise<
	z.output<TResponseSchema>
>;
