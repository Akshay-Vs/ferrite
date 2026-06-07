// ─── domain types ─────────────────────────────────────────────────────────────

export interface OrderData {
	processing: number;
	delivered: number;
	inTransit: number;
	cancelled: number;
	returned: number;
}

export type SegKey =
	| 'delivered'
	| 'inTransit'
	| 'processing'
	| 'returned'
	| 'cancelled';

export interface SegDef {
	key: SegKey;
	count: number;
	label: string;
	above: boolean;
}

// ─── chart config ─────────────────────────────────────────────────────────────

/** Fixed pill height in px */
export const PILL_HEIGHT = 64;

/** Horizontal px offset applied to legend label endpoints for angled lines */
export const ANGLE_OFFSET_X = 30;

/** Stagger delay (ms) between each legend appearing on hover */
export const STAGGER_DELAY_MS = 60;

/** Vertical distance from pill edge to the legend dot */
export const LEGEND_GAP_Y = 22;

/** Minimum px between adjacent legend labels before redistribution */
export const MIN_LABEL_GAP = 90;

export const COLOR: Record<SegKey, string> = {
	delivered: '#79FF89',
	inTransit: '#3DB84A',
	processing: '#79FDFF',
	returned: '#FF7D79',
	cancelled: '#C93835',
};

export const STRIPED_KEYS: SegKey[] = ['delivered', 'inTransit'];
