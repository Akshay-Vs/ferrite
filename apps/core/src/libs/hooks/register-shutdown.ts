import { INestApplication } from '@nestjs/common';
import { otelSDK } from '../../instrumentation';

export const registerShutdownHook = (app: INestApplication) => {
	let isShuttingDown = false;

	const shutdown = (reason: string) => (err: unknown) => {
		if (isShuttingDown) return;
		isShuttingDown = true;

		console.error(`Shutting down due to ${reason}:`, err);

		// Close open telemetry resources

		app
			.close()
			.then(() => console.log('Application closed successfully.'))
			.catch((e) => console.error('Error closing application:', e))
			.finally(() =>
				otelSDK
					.shutdown()
					.then(() =>
						console.log('OpenTelemetry resources shut down successfully.')
					)
					.catch((e) => console.error('Error shutting down:', e))
					.finally(() => {
						setTimeout(() => {
							process.exit(reason === 'SIGINT' || reason === 'SIGTERM' ? 0 : 1);
						}, 100);
					})
			);
	};

	process.on('uncaughtException', shutdown('uncaughtException'));
	process.on('unhandledRejection', shutdown('unhandledRejection'));
	process.on('SIGINT', shutdown('SIGINT'));
	process.on('SIGTERM', shutdown('SIGTERM'));
};
