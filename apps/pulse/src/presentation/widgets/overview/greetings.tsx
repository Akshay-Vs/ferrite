'use client';

import { useUser } from '@clerk/nextjs';
import { getGreetingText } from '@/core/utils/get-greetings-text';
import GradientText from '@/presentation/primitives/gradient-text';
import { Skeleton } from '@/presentation/primitives/skeleton';

const Greetings = () => {
	const { isSignedIn, isLoaded, user } = useUser();

	const greeting = getGreetingText();
	const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`;

	if (isLoaded && !isSignedIn) {
		return null;
	}

	return (
		<div className="col gap-2">
			{' '}
			{!isLoaded ? (
				<>
					<Skeleton className="h-12 w-100" />
					<Skeleton className="h-5 w-60 mt-2" />
				</>
			) : (
				<>
					<h1 className="text-[2.42rem] font-[250]">
						{greeting}
						{', '}
						<GradientText className="font-[280]" text={fullName} />
					</h1>

					<p className="font-light text-base">
						You have <span className="text-orange-100">2 assigned tasks</span>.
					</p>
				</>
			)}
		</div>
	);
};

export default Greetings;
