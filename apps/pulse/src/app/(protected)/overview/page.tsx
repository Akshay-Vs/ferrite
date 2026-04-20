'use client';
import { useState } from 'react';
import { TabBar } from '@/presentation/primitives/tab-bar';

const overviewPage = () => {
	const [activeId, setActiveId] = useState('1');

	return (
		<div className="full center min-h-[87vh]">
			<TabBar
				className="mx-7"
				gap={16}
				activeId={activeId}
				items={[
					{ id: '1', label: 'All' },
					{ id: '2', label: 'Now' },
				]}
				onChange={(id) => {
					setTimeout(() => {
						setActiveId(id.toString());
					}, 1000);
				}}
			/>
		</div>
	);
};

export default overviewPage;
