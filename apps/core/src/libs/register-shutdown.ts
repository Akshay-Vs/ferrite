import { INestApplication } from '@nestjs/common';

export const registerShutdownHook = (app: INestApplication) => {
	let isShuttingDown = false;

	const shutdown = (reason: string) => (err: unknown) => {
		if (isShuttingDown) return;
		isShuttingDown = true;

		console.error(`Shutting down due to ${reason}:`, err);
		app.close().finally(() => process.exit(1));
	};

	app.enableShutdownHooks();

	process.on('uncaughtException', shutdown('uncaughtException'));
	process.on('unhandledRejection', shutdown('unhandledRejection'));
};
