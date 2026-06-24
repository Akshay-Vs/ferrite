import {
	DEFAULT_TTL_MS,
	getImageCacheDB,
	IMAGE_STORE,
	type ImageCacheEntry,
	MAX_CACHE_ENTRIES,
} from './image-cache.idb';

// Write

/**
 * Store an image blob in the cache. Overwrites any existing entry for the same URL.
 *
 * @param url       - The full request URL (used as the primary key).
 * @param blob      - The raw image blob.
 * @param contentType - MIME type (e.g. `image/png`).
 * @param ttlMs     - Time-to-live in milliseconds. Defaults to 24 hours.
 */
export async function putImage(
	url: string,
	blob: Blob,
	contentType: string,
	ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
	const db = await getImageCacheDB();
	const now = Date.now();

	await db.put(IMAGE_STORE, {
		url,
		blob,
		contentType,
		expireAt: now + ttlMs,
		cachedAt: now,
	});

	// Fire and forget LRU enforcement
	enforceLRU().catch((err) =>
		console.error('Failed to enforce LRU cache limit:', err)
	);
}

/**
 * Enforce the LRU cache limit.
 * If the number of items exceeds MAX_CACHE_ENTRIES, delete the oldest items.
 */
export async function enforceLRU(): Promise<void> {
	const db = await getImageCacheDB();
	const count = await db.count(IMAGE_STORE);

	if (count <= MAX_CACHE_ENTRIES) return;

	const overflow = count - MAX_CACHE_ENTRIES;
	const tx = db.transaction(IMAGE_STORE, 'readwrite');
	const index = tx.store.index('by-cachedAt');
	let cursor = await index.openCursor();

	let deleted = 0;
	while (cursor && deleted < overflow) {
		cursor.delete();
		deleted++;
		cursor = await cursor.continue();
	}

	await tx.done;
}

// Read

/**
 * Retrieve a cached image by URL. If the entry exists but has expired it is
 * deleted and `null` is returned (lazy eviction).
 */
export async function getImage(url: string): Promise<ImageCacheEntry | null> {
	const db = await getImageCacheDB();
	const entry = await db.get(IMAGE_STORE, url);

	if (!entry) return null;

	if (entry.expireAt <= Date.now()) {
		await db.delete(IMAGE_STORE, url);
		return null;
	}

	return entry;
}

// Delete

/**
 * Remove a single cached image by URL. No-op if the key doesn't exist.
 */
export async function deleteImage(url: string): Promise<void> {
	const db = await getImageCacheDB();
	await db.delete(IMAGE_STORE, url);
}

// Batch Eviction

/**
 * Delete up to `batchSize` expired entries using the `by-expireAt` index.
 *
 * Designed for use inside an interval loop:
 *
 * ```ts
 * while (await evictExpiredBatch(50)) {
 *   await sleep(100);
 * }
 * ```
 *
 * @param batchSize - Maximum number of expired entries to delete in one pass.
 * @returns `true` if the batch was full (more expired entries may remain),
 *          `false` if fewer than `batchSize` entries were deleted (done).
 */
export async function evictExpiredBatch(batchSize: number): Promise<boolean> {
	const db = await getImageCacheDB();
	const tx = db.transaction(IMAGE_STORE, 'readwrite');
	const index = tx.store.index('by-expireAt');

	// Only walk entries whose expireAt ≤ now.
	const range = IDBKeyRange.upperBound(Date.now());
	let cursor = await index.openCursor(range);

	let deleted = 0;

	while (cursor && deleted < batchSize) {
		cursor.delete();
		deleted++;
		cursor = await cursor.continue();
	}

	await tx.done;

	return deleted === batchSize;
}
