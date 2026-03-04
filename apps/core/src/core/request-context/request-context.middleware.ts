import { randomUUID } from 'node:crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { requestContext } from './request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction): void {
		const rawRequestId = req.header('x-request-id');

		const requestId =
			typeof rawRequestId === 'string' && rawRequestId.trim().length > 0
				? rawRequestId
				: randomUUID();

		res.setHeader('x-request-id', requestId);
		requestContext.run({ requestId }, next);
	}
}
