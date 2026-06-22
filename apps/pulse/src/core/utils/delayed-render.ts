import { type ReactNode, useEffect, useState } from 'react';

interface DelayedFallbackProps {
	/** How long to wait before showing the fallback content, in ms. */
	delay: number;
	children: ReactNode;
}

/**
 * Use as a <Suspense> fallback to avoid flashing a loader on fast loads.
 * Renders nothing until `delay` ms have passed; if the suspended content
 * resolves before then, React unmounts this before it ever shows.
 */
export function DelayedRender({
	delay,
	children,
}: DelayedFallbackProps): ReactNode {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const id = setTimeout(() => setShow(true), delay);
		return () => clearTimeout(id);
	}, [delay]);

	if (!show) return null;
	return children;
}
