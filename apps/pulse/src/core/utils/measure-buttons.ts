export function measureButtons(
	container: HTMLDivElement,
	count: number
): { left: number; width: number }[] | null {
	const buttons = container.querySelectorAll<HTMLButtonElement>('button');
	if (buttons.length !== count) return null;
	return Array.from(buttons).map((b) => ({
		left: b.offsetLeft,
		width: b.offsetWidth,
	}));
}
