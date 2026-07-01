// @ts-check
import { serwist } from '@serwist/next/config';

export default serwist({
	swSrc: 'src/app/sw.ts',
	swDest: 'public/sw.js',
	additionalPrecacheEntries: [
		{
			url: '/~offline',
			revision: process.env.SW_REVISION ?? crypto.randomUUID().slice(0, 8),
		},
	],
	globDirectory: '.next',
});
