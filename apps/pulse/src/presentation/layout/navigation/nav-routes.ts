import {
	CAMPAIGNS,
	INVENTORY,
	ORDERS,
	OVERVIEW,
	USERS,
} from '@/core/constants/routes.constrains';

export const NavRoutes = [
	{ id: 'overview-link', label: 'Overview', href: OVERVIEW },
	{ id: 'orders-link', label: 'Orders', href: ORDERS },
	{ id: 'inventory-link', label: 'Inventory', href: INVENTORY },
	{ id: 'users-link', label: 'Users', href: USERS },
	{ id: 'campaigns-link', label: 'Campaigns', href: CAMPAIGNS },
];
