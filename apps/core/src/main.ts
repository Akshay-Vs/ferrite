import { AppLogger } from '@core/logger/logger.service';
import { registerShutdownHook } from '@libs/hooks/register-shutdown';
import { Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { otelSDK } from './instrumentation';
import { setupSwagger } from './swagger';

const PORT = process.env.PORT ?? 4000;
const VERSION = process.env.VERSION ?? 'v1';
const ORIGIN = process.env.ORIGIN_URL?.trim()
	? process.env.ORIGIN_URL.trim().split(/\s+/)
	: [];

NestLogger.debug(
	`Using: ${JSON.stringify({ port: PORT, version: VERSION, origin: ORIGIN }, null, 2)}`,
	'GLOBAL'
);

const logger = new NestLogger('Main');

/**
 * Create, configure, and start the NestJS application.
 *
 * Configures shutdown hooks, application logger, security middleware, CORS, global route prefix,
 * and a global OpenTelemetry interceptor; registers a request-logging middleware; conditionally
 * sets up Swagger; starts the HTTP server on the configured port and logs the active port.
 */
async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
		rawBody: true,
	});

	registerShutdownHook(app);

	// Enable raw body parsing for webhooks
	app.use('/webhooks', express.raw({ type: 'application/json' }));

	app.useLogger(await app.resolve(AppLogger));
	app.use(helmet());

	app.enableCors({
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		origin: ORIGIN,
		credentials: true,
	});

	app.setGlobalPrefix(VERSION);

	app.use((req: Request, _res: Response, next: NextFunction) => {
		logger.debug(`Request: ${req.method} ${req.path} received`);
		next();
	});

	if (process.env.ENABLE_SWAGGER || process.env.NODE_ENV !== 'production') {
		setupSwagger(app);
	}

	await app.listen(PORT);
	NestLogger.log(`Application Port: ${PORT}`, '');
}

void (async (): Promise<void> => {
	try {
		otelSDK.start();
		await bootstrap();
		logger.log(
			`Server Started in ${process.env.NODE_ENV ?? 'production'} mode`
		);
	} catch (error) {
		try {
			await otelSDK.shutdown();
		} catch (shutdownError) {
			logger.error(shutdownError);
		} finally {
			process.exit(1);
		}
	}
})();
