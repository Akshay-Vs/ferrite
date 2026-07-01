/// <reference lib="esnext" />
/// <reference lib="webworker" />

import {
	imageCacheHandler,
	imageCacheMatcher,
} from '@core/sw/image-cache/image-cache.interceptor';
import { evictExpiredBatch } from '@core/sw/image-cache/image-cache.repository';
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	disableDevLogs: true,
	runtimeCaching: [
		{
			matcher: imageCacheMatcher,
			handler: imageCacheHandler,
		},
		...defaultCache,
	],
	fallbacks: {
		entries: [
			{
				url: '/~offline',
				matcher({ request }) {
					return request.destination === 'document';
				},
			},
		],
	},
});
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	// For "/legacy-post" with the method "POST", this simply makes a network request,
	// but if that fails due to a network problem, the request is added to the background
	// synchronization queue and will be retried later.
	if (
		event.request.method === 'POST' &&
		url.origin === location.origin &&
		url.pathname === '/legacy-post'
	) {
		const backgroundSync = async () => {
			try {
				console.log('🔄 Background syncing...');
				const response = await fetch(event.request.clone());
				return response;
			} catch (error) {
				console.error('🔄 Background syncing failed:', error);
				return Response.error();
			}
		};
		event.respondWith(backgroundSync());
	}
});

serwist.addEventListeners();

// Background cleanup for expired cache entries (runs every hour)
setInterval(
	() => {
		const runCleanup = async () => {
			try {
				while (await evictExpiredBatch(50)) {
					// Yield to the event loop
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			} catch (err) {
				console.error('Image cache background cleanup failed:', err);
			}
		};
		void runCleanup();
	},
	60 * 60 * 1000
);
