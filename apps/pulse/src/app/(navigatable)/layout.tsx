import type { PropsWithChildren } from 'react';
import { NavBar } from '@/presentation/layout/navigation/nav-bar';

const layout = ({ children }: PropsWithChildren) => {
	return (
		<main className="p-6">
			<NavBar />
			{children}
		</main>
	);
};

export default layout;
