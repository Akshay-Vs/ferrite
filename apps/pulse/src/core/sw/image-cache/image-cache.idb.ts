import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

// Types

export interface ImageCacheEntry {
	/** The full URL — used as the primary key. */
	url: string;
	/** The raw image blob. */
	blob: Blob;
	/** MIME type (e.g. `image/png`). */
	contentType: string;
	/** Unix-ms timestamp after which this entry is considered stale. */
	expireAt: number;
	/** Unix-ms timestamp when the entry was written. */
	cachedAt: number;
}

export interface ImageCacheDB extends DBSchema {
	images: {
		key: string;
		value: ImageCacheEntry;
		indexes: {
			'by-expireAt': number;
			'by-cachedAt': number;
		};
	};
}

// Constants

const DB_NAME = 'ferrite-image-cache';
const DB_VERSION = 1;

export const IMAGE_STORE = 'images' as const;
export const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_CACHE_ENTRIES = 200; // Maximum number of items in the cache

// Singleton Connection

let dbInstance: IDBPDatabase<ImageCacheDB> | null = null;

/**
 * Returns a singleton IDB connection. The database and object store are
 * created on first open (upgrade callback).
 */
export async function getImageCacheDB(): Promise<IDBPDatabase<ImageCacheDB>> {
	if (dbInstance) return dbInstance;

	dbInstance = await openDB<ImageCacheDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			const store = db.createObjectStore(IMAGE_STORE, { keyPath: 'url' });
			store.createIndex('by-expireAt', 'expireAt');
			store.createIndex('by-cachedAt', 'cachedAt');
		},
	});

	return dbInstance;
}
