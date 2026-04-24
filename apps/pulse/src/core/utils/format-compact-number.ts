interface FormatOptions {
	decimals?: number; // digits after decimal
	truncate?: boolean; // true = truncate, false = round
}

export function formatCompactNumber(
	value: number,
	options: FormatOptions = {}
): string {
	const { decimals = 1, truncate = false } = options;

	const abs = Math.abs(value);

	const units = [
		{ threshold: 1e12, suffix: 'T' },
		{ threshold: 1e9, suffix: 'B' },
		{ threshold: 1e6, suffix: 'M' },
		{ threshold: 1e3, suffix: 'K' },
	];

	for (const { threshold, suffix } of units) {
		if (abs >= threshold) {
			const raw = value / threshold;

			const factor = 10 ** decimals;
			const processed = truncate
				? Math.trunc(raw * factor) / factor
				: Math.round(raw * factor) / factor;

			return `${processed}${suffix}`;
		}
	}

	// small numbers: return as-is with optional formatting
	const factor = 10 ** decimals;
	const processed = truncate
		? Math.trunc(value * factor) / factor
		: Math.round(value * factor) / factor;

	return processed.toString();
}
