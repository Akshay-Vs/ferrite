import type { SegDef } from './orders-status-chart.types';
import { MIN_LABEL_GAP } from './orders-status-chart.types';

// ─── segment proportion builder ──────────────────────────────────────────────

export interface SegmentSlice {
	def: SegDef;
	/** Proportion start (0–1) */
	x0: number;
	/** Proportion end (0–1) */
	x1: number;
	/** Proportion midpoint (0–1) */
	mid: number;
}

/**
 * Convert segment definitions into cumulative proportions (0–1 range).
 * No pixel math — call `xScale(slice.x0)` etc. to get pixel values.
 */
export function buildSlices(defs: SegDef[], total: number): SegmentSlice[] {
	let cumulative = 0;
	return defs.map((def) => {
		const fraction = def.count / total;
		const x0 = cumulative;
		const x1 = cumulative + fraction;
		cumulative = x1;
		return { def, x0, x1, mid: (x0 + x1) / 2 };
	});
}

// ─── legend label spread ─────────────────────────────────────────────────────

/**
 * Given a list of natural center-x positions, redistribute evenly across
 * `rangeWidth` if any two are closer than `MIN_LABEL_GAP`.
 */
export function spreadLabelPositions(
	naturalXs: number[],
	rangeWidth: number
): number[] {
	const tooClose = naturalXs.some(
		(x, i) => i > 0 && x - naturalXs[i - 1] < MIN_LABEL_GAP
	);
	if (!tooClose) return naturalXs;
	const step = rangeWidth / (naturalXs.length + 1);
	return naturalXs.map((_, i) => step * (i + 1));
}
