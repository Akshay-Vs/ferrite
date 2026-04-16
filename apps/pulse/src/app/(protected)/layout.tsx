import type { PropsWithChildren } from 'react';
import { NavBar } from '@/presentation/layout/navigation/nav-bar';

const layout = ({ children }: PropsWithChildren) => {
	return (
		<>
			<NavBar />
			{children}
		</>
	);
};

export default layout;
