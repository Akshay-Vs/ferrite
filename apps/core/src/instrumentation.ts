// src/instrumentation.ts

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
	url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
		? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
		: 'http://localhost:4318/v1/traces',
});

const metricExporter = new OTLPMetricExporter({
	url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
		? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
		: 'http://localhost:4318/v1/metrics',
});
export const otelSDK = new NodeSDK({
	resource: resourceFromAttributes({
		[ATTR_SERVICE_NAME]: process.env.SERVICE_NAME ?? 'ferrite-core',
		[ATTR_SERVICE_VERSION]: process.env.SERVICE_VERSION ?? '1.0.0',
		'deployment.environment': process.env.NODE_ENV ?? 'development',
	}),
	spanProcessor: new BatchSpanProcessor(traceExporter, {
		maxQueueSize: 2048,
		maxExportBatchSize: 512,
		scheduledDelayMillis: 5000,
	}),
	metricReader: new PeriodicExportingMetricReader({
		exporter: metricExporter,
		exportIntervalMillis: 60_000,
	}),
	instrumentations: [
		new NestInstrumentation(), // NestJS-specific spans (controllers, guards, pipes)
		getNodeAutoInstrumentations({
			'@opentelemetry/instrumentation-fs': { enabled: false }, // too noisy
			'@opentelemetry/instrumentation-http': { enabled: true },
		}),
	],
});
