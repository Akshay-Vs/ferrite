import { useEffect, useState } from 'react';

export function useLowFPS(threshold = 30): boolean {
	const [isLowFPS, setIsLowFPS] = useState(false);

	useEffect(() => {
		let lastTime = performance.now();
		let frames = 0;
		let animationFrameId: number;

		function measureFPS() {
			frames++;
			const now = performance.now();
			if (now - lastTime >= 1000) {
				const fps = frames;
				frames = 0;
				lastTime = now;

				setIsLowFPS(fps < threshold);
			}
			animationFrameId = requestAnimationFrame(measureFPS);
		}

		animationFrameId = requestAnimationFrame(measureFPS);

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [threshold]);

	return isLowFPS;
}
