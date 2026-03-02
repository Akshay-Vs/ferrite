import { Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

const PORT = process.env.PORT ?? 4000;
const VERSION = process.env.VERSION ?? 'v1';
const ORIGIN = process.env.ORIGIN_URL?.trim()
	? process.env.ORIGIN_URL.trim().split(/\s+/)
	: [];

NestLogger.debug(
	`Using env: ${JSON.stringify({ port: PORT, origin: ORIGIN }, null, 2)}`,
	'GLOBAL'
);

const logger = new NestLogger('Bootstrap');

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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

	setupSwagger(app);

	await app.listen(PORT);
	NestLogger.log(`Application Port: ${PORT}`, '');
}

void (async (): Promise<void> => {
	try {
		await bootstrap();
		logger.log(
			`Server Started in ${process.env.NODE_ENV ?? 'PRODUCTION'} mode`
		);
	} catch (error) {
		logger.error(error);
	}
})();
