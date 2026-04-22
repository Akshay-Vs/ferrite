type Greeting = 'Good Morning' | 'Afternoon' | 'Evening' | 'Good Night';

interface Options {
	date?: Date;
	context?: 'greeting' | 'farewell';
}

export function getGreetingText({
	date = new Date(),
	context = 'greeting',
}: Options = {}): Greeting {
	const hour = date.getHours();

	if (hour >= 5 && hour < 12) {
		return 'Good Morning';
	}

	if (hour >= 12 && hour < 17) {
		return 'Afternoon';
	}

	if (hour >= 17 && hour < 21) {
		return 'Evening';
	}

	// 21–4
	if (context === 'farewell') {
		return 'Good Night';
	}

	return 'Evening';
}
