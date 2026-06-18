import { randomUUID } from 'node:crypto';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { requestContext } from './request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	use(req: IncomingMessage, res: ServerResponse, next: () => void): void {
		const rawRequestId = req.headers['x-request-id'];

		const normalizedRequestId =
			typeof rawRequestId === 'string' ? rawRequestId.trim() : undefined;

		const requestId =
			normalizedRequestId && normalizedRequestId.length > 0
				? normalizedRequestId
				: randomUUID();

		res.setHeader('x-request-id', requestId);
		requestContext.run({ requestId }, next);
	}
}
