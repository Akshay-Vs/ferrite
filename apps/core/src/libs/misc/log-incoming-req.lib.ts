import { IncomingMessage } from 'node:http';
import { Logger } from '@nestjs/common';

export const logIncomingRequest = (
	req: IncomingMessage,
	logger: Logger
): void => {
	const requestUrl = req.url ?? '';
	const path = (() => {
		try {
			return new URL(requestUrl, 'http://localhost').pathname;
		} catch {
			return requestUrl.split('?')[0] ?? '';
		}
	})();
	const safePath = path.replace(/[\r\n]/g, '');
	logger.debug(`Request: ${req.method} ${safePath} received`);
};
