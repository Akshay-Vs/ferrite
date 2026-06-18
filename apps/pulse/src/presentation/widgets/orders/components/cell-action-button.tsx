'use client';

import { cn } from '@/core/utils/cn';
import { Button } from '@/presentation/primitives/button';

type Props = {
	value: string;
	action: () => void;
	className?: string;
};

const CellActionButton = ({ value, action, className }: Props) => {
	const handleClick = (
		e:
			| React.MouseEvent<HTMLButtonElement>
			| React.KeyboardEvent<HTMLButtonElement>
	) => {
		e.stopPropagation();
		action();
	};

	return (
		<Button
			unstyled
			className={cn(
				'hover:underline underline-offset-4 hover:cursor-pointer',
				className
			)}
			title="View details"
			onClick={handleClick}
			onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					e.stopPropagation();
					handleClick(e);
				}
			}}
		>
			{value}
		</Button>
	);
};

export default CellActionButton;
