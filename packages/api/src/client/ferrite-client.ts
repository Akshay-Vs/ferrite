import axios, { type AxiosInstance } from 'axios';
import type { ZodType } from 'zod/v4';
import { ContractViolationError } from '../errors';
import {
	handleHttpErrorInterceptor,
	injectAuthHeaderInterceptor,
} from '../interceptors';
import type {
	ApiResponse,
	FerriteApiConfig,
	HttpRequestOptions,
	IFerriteClient,
	PayloadData,
	RequestConfig,
} from '../interfaces';

/**
 * API client for interacting with the Ferrite API.
 */
export class FerriteClient implements IFerriteClient {
	private readonly instance: AxiosInstance;

	constructor(private readonly config: FerriteApiConfig) {
		const version = config.version ?? 'v1';
		const normalizedBaseURL = config.baseURL.replace(/\/$/, '');
		const baseURL = version
			? `${normalizedBaseURL}/${version}`
			: normalizedBaseURL;

		this.instance = axios.create({
			baseURL,
			timeout: 30_000,
			headers: { 'Content-Type': 'application/json' },
			...config.axiosDefaults,
		});

		this.setupInterceptors();
	}

	private setupInterceptors(): void {
		// ── Request interceptor — inject auth token ──
		this.instance.interceptors.request.use(
			injectAuthHeaderInterceptor(this.config)
		);

		// ── Response interceptor — transform errors ──
		this.instance.interceptors.response.use(
			(response) => response,
			handleHttpErrorInterceptor()
		);
	}

	// ─── Core Request Method ───────────────────────────────────────────────────

	/**
	 * Generic request method with runtime validation for both payload and response.
	 *
	 * @throws {ApiTransportError}       Network / HTTP failure
	 * @throws {ContractViolationError}  Payload or response does not satisfy the Zod schema
	 * @throws {AuthSessionError}        HTTP 401 Unauthorized (session dead)
	 */
	public async request<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		config: RequestConfig<TResponseSchema, TPayloadSchema>
	): ApiResponse<TResponseSchema> {
		const { responseSchema, payloadSchema, data, ...axiosConfig } = config;

		let validatedData = data;

		// Validate outbound payload if a schema is provided
		if (payloadSchema && data !== undefined) {
			const payloadResult = payloadSchema.safeParse(data);
			if (!payloadResult.success) {
				throw new ContractViolationError(payloadResult.error, data, 'request');
			}
			validatedData = payloadResult.data as typeof data;
		}

		// Transport/Auth errors are transformed by the Axios interceptor
		const response = await this.instance.request({
			...axiosConfig,
			data: validatedData,
		});

		// Validate inbound response
		const responseResult = responseSchema.safeParse(response.data);

		if (!responseResult.success) {
			throw new ContractViolationError(
				responseResult.error,
				response.data,
				'response'
			);
		}

		return responseResult.data;
	}

	// ─── Convenience Methods ───────────────────────────────────────────────────

	public async get<TResponseSchema extends ZodType>(
		url: string,
		responseSchema: TResponseSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema> {
		return this.request({
			...config,
			method: 'GET',
			url,
			responseSchema,
		});
	}

	public async post<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		url: string,
		responseSchema: TResponseSchema,
		data?: PayloadData<TPayloadSchema>,
		payloadSchema?: TPayloadSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema> {
		return this.request({
			...config,
			method: 'POST',
			url,
			data,
			responseSchema,
			payloadSchema,
		});
	}

	public async put<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		url: string,
		responseSchema: TResponseSchema,
		data?: PayloadData<TPayloadSchema>,
		payloadSchema?: TPayloadSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema> {
		return this.request({
			...config,
			method: 'PUT',
			url,
			data,
			responseSchema,
			payloadSchema,
		});
	}

	public async patch<
		TResponseSchema extends ZodType,
		TPayloadSchema extends ZodType | undefined = undefined,
	>(
		url: string,
		responseSchema: TResponseSchema,
		data?: PayloadData<TPayloadSchema>,
		payloadSchema?: TPayloadSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema> {
		return this.request({
			...config,
			method: 'PATCH',
			url,
			data,
			responseSchema,
			payloadSchema,
		});
	}

	public async delete<TResponseSchema extends ZodType>(
		url: string,
		responseSchema: TResponseSchema,
		config?: HttpRequestOptions
	): ApiResponse<TResponseSchema> {
		return this.request({
			...config,
			method: 'DELETE',
			url,
			responseSchema,
		});
	}

	/**
	 * Exposes the underlying Axios instance if raw access is ever needed
	 * (e.g. for testing with mock adapters).
	 */
	public getAxiosInstance(): AxiosInstance {
		return this.instance;
	}
}
