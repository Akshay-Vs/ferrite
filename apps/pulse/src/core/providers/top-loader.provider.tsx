import NextTopLoader from 'nextjs-toploader';
import type { PropsWithChildren } from 'react';

const TopLoaderProvider = ({ children }: PropsWithChildren) => {
	return (
		<div className="min-h-dvh max-w-dvw flex flex-col">
			<NextTopLoader color="#A68BF8FA" height={3} showSpinner={false} />
			{children}
		</div>
	);
};

export default TopLoaderProvider;
