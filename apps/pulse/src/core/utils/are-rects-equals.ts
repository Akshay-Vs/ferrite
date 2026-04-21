export function areRectsEqual(
	a: { left: number; width: number }[],
	b: { left: number; width: number }[]
): boolean {
	return (
		a.length === b.length &&
		a.every((r, i) => r.left === b[i].left && r.width === b[i].width)
	);
}
