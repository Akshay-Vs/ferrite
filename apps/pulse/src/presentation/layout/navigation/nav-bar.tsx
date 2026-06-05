import { Logo } from '@presentation/primitives/logo';
import NavStoreSelector from '@/presentation/widgets/store-selector';
import { NavAction } from './nav-actions';
import { NavAvatar } from './nav-avatar';
import { NavLinks } from './nav-links';

export const NavBar = () => {
	return (
		<div id="navigation-container" className="sticky top-0 z-50 py-4 mb-8">
			<nav className="flex items-center justify-between px-5">
				<Logo size={'lg'} />
				<div className="flex items-center gap-6">
					<NavLinks />
					<NavStoreSelector />
					<NavAction />
					<NavAvatar />
				</div>
			</nav>
		</div>
	);
};
