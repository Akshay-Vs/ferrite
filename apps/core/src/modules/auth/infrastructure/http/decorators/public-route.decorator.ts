import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_ROUTE = Symbol('IS_PUBLIC_KEY');

export const PublicRoute = (): CustomDecorator<typeof IS_PUBLIC_ROUTE> =>
	SetMetadata(IS_PUBLIC_ROUTE, true);
