'use client';

import { icons, type LucideProps } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@core/utils/utils';

interface IconRendererProps extends LucideProps {
	/** Identifier for the icon asset. */
	name: string;
	/** Fallback asset identifier utilized if the primary name is unresolved. */
	fallback?: keyof typeof icons;
}

export function IconRenderer({
	name,
	fallback = 'Store',
	className,
	...props
}: IconRendererProps) {
	const IconComponent = useMemo(() => {
		// Strict property lookup
		const Resolved = icons[name as keyof typeof icons];
		if (Resolved) return Resolved;

		// Fallback resolution with a hard-coded safety default
		return icons[fallback] || icons.Store;
	}, [name, fallback]);

	return <IconComponent className={cn('shrink-0', className)} {...props} />;
}
