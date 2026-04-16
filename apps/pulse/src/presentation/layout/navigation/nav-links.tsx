'use client';

import { TabBar } from '@presentation/primitives/tab-bar';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { NavRoutes } from './nav-routes';

export const NavLinks = () => {
	const router = useRouter();
	const pathname = usePathname();

	const activeId =
		NavRoutes.find((link) => link.href === pathname)?.id ?? NavRoutes[0].id;

	return (
		<TabBar
			className="mx-7"
			gap={16}
			activeId={activeId}
			items={NavRoutes.map((link) => ({
				id: link.id,
				label: link.label,
			}))}
			onChange={(id) => {
				const link = NavRoutes.find((l) => l.id === id);
				if (link) router.push(link.href);
			}}
		/>
	);
};
