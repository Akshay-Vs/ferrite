import { useEffect, useState } from 'react';

export default function useCountdown(timeLimit = 30000) {
	const [timeLeft, setTimeLeft] = useState(timeLimit);

	useEffect(() => {
		if (timeLeft <= 0) return;

		const interval = setInterval(() => {
			setTimeLeft((time) => Math.max(0, time - 1000));
		}, 1000);

		return () => clearInterval(interval);
	}, [timeLeft]);

	const restartTimer = () => {
		if (timeLeft > 0) return;
		setTimeLeft(timeLimit);
	};

	const isTimeDue = timeLeft <= 0;

	return { timeLeft, isTimeDue, restartTimer };
}
