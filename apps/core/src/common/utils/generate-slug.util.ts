import { v4 as uuidv4 } from 'uuid';

interface SlugOptions {
	prefix?: string;
	suffix?: string;
	separator?: string;
	includeUuid?: boolean;
	maxLength?: number;
}

/**
 * Generates a URL-safe slug from input text, optionally combined with a UUID.
 *
 * @param input   - The base string to slugify (e.g. a title or label)
 * @param options - Optional configuration
 */
export function generateSlug(input: string, options: SlugOptions = {}): string {
	const {
		prefix,
		suffix,
		separator = '-',
		includeUuid = true,
		maxLength,
	} = options;

	// Normalize the input into a slug-safe string
	const slugified = input
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // strip non-word chars (except spaces/hyphens)
		.replace(/[\s_]+/g, separator) // spaces/underscores → separator
		.replace(/-+/g, separator); // collapse repeated separators

	const uuid = includeUuid ? uuidv4() : null;

	// Assemble parts in order: prefix → slugified input → uuid → suffix
	const parts = [
		prefix && slugify(prefix, separator),
		slugified,
		uuid,
		suffix && slugify(suffix, separator),
	].filter(Boolean) as string[];

	let result = parts.join(separator);

	if (maxLength) {
		result = result.slice(0, maxLength);
		// Avoid trailing separators after truncation
		result = result.replace(new RegExp(`${separator}+$`), '');
	}

	return result;
}

/** Helper: slugify a short string (used for prefix/suffix) */
function slugify(text: string, separator: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, separator)
		.replace(/-+/g, separator);
}
