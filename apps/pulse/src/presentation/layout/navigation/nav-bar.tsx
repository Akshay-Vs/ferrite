import { Logo } from '@presentation/primitives/logo';
import { NavAction } from './nav-actions';
import { NavAvatar } from './nav-avatar';
import NavStoreSelector from './nav-store-selector';
import { NavLinks } from './nav-links';

export const NavBar = () => {
  return (
    <div>
      <nav className="flex items-center justify-between">
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
