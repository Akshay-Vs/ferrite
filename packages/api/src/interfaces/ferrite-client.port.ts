import type { AxiosInstance } from 'axios';
import type { ZodType } from 'zod/v4';
import type {
	ApiResponse,
	HttpRequestOptions,
	PayloadData,
	RequestConfig,
} from './request-config.interface';

/**
 * Port definition for the Ferrite API Client.
 * Consumers should depend on this interface for mockability and clean architecture.
 */
export interface IFerriteClient {
	/**
	 * Generic request method with runtime validation for both payload and response.
	 */
	request<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		config: RequestConfig<TResponseSchema, TPayloadSchema>
	): ApiResponse<TResponseSchema>;

	get<TResponseSchema extends ZodType>(
		url: string,
		responseSchema: TResponseSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema>;

	post<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		url: string,
		responseSchema: TResponseSchema,
		data?: PayloadData<TPayloadSchema>,
		payloadSchema?: TPayloadSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema>;

	put<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		url: string,
		responseSchema: TResponseSchema,
		data?: PayloadData<TPayloadSchema>,
		payloadSchema?: TPayloadSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema>;

	patch<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		url: string,
		responseSchema: TResponseSchema,
		data?: PayloadData<TPayloadSchema>,
		payloadSchema?: TPayloadSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema>;

	delete<TResponseSchema extends ZodType>(
		url: string,
		responseSchema: TResponseSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema>;

	/**
	 * Exposes the underlying Axios instance if raw access is ever needed.
	 */
	getAxiosInstance(): AxiosInstance;
}
