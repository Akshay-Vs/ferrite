import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { requestContext } from './request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction): void {
		const requestId =
			(req.headers['x-request-id'] as string) ?? crypto.randomUUID();

		res.setHeader('x-request-id', requestId);
		requestContext.run({ requestId }, next);
	}
}
