import type { RouteHandlerCallback, RouteMatchCallback } from 'serwist';
import { getImage, putImage } from './image-cache.repository';

// Ignore List

/**
 * Regex patterns for URLs that should NOT be cached in IndexedDB.
 * Any image request whose `url.href` matches one of these is skipped.
 */
const IMAGE_CACHE_IGNORE: RegExp[] = [
	/favicon/i,
	/\.svg(\?|$)/i,
	/\/icons?\//i,
];

// Matcher

/**
 * Serwist-compatible route matcher. Returns `true` for image requests
 * whose URL does not match any entry in `IMAGE_CACHE_IGNORE`.
 */
export const imageCacheMatcher: RouteMatchCallback = ({ request, url }) => {
	if (request.destination !== 'image') return false;
	return !IMAGE_CACHE_IGNORE.some((pattern) => pattern.test(url.href));
};

// Handler

/**
 * Serwist-compatible route handler.
 *
 * Flow:
 *  1. Check IDB for a cached (non-expired) entry.
 *  2. On HIT  → return a reconstructed `Response` from the stored blob.
 *  3. On MISS → fetch from network, cache the response blob, return response.
 */
export const imageCacheHandler: RouteHandlerCallback = async ({
	request,
	url,
}) => {
	const cacheKey = url.href;

	// 1. IDB lookup
	const cached = await getImage(cacheKey);

	if (cached) {
		return new Response(cached.blob, {
			status: 200,
			statusText: 'OK',
			headers: {
				'Content-Type': cached.contentType,
				'Content-Length': String(cached.blob.size),
				Date: new Date(cached.cachedAt).toUTCString(),
				'X-Cache': 'HIT',
			},
		});
	}

	// 2. Network fetch
	const response = await fetch(request);

	// Only cache successful, non-opaque responses where we can read the body.
	if (response.ok) {
		const clone = response.clone();

		// Fire-and-forget — don't block the response on the IDB write.
		clone
			.blob()
			.then((blob) => {
				const contentType =
					clone.headers.get('Content-Type') || 'application/octet-stream';
				return putImage(cacheKey, blob, contentType);
			})
			.catch((err) => {
				console.error('Failed to cache image in IDB', err);
			});
	}

	return response;
};
