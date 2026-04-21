'use client';
import { useState } from 'react';
import { Button } from '@/presentation/primitives/button';
import { toast } from '@/presentation/primitives/sonner';
import { TabBar } from '@/presentation/primitives/tab-bar';

const overviewPage = () => {
	const [activeId, setActiveId] = useState('1');
	const initializeInfrastructure = async () => {
		// Simulating a volatile API dispatch with a 50% failure rate
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				Math.random() > 0.5
					? resolve({ status: 'Operational' })
					: reject(new Error('Network Timeout'));
			}, 2500);
		});
	};

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

			<Button
				onClick={() =>
					toast.promise(initializeInfrastructure, {
						// 1. Rich Transient State: Supplying a full object for the loading phase
						loading: {
							title: 'Provisioning Infrastructure...',
							description:
								'Allocating database shards. This process may take several moments.',
							cancel: {
								label: 'Cancel',
								onClick: () => console.log('Abort signal dispatched to API.'),
							},
						},

						// 2. Success Resolution
						success: () => ({
							title: 'Initialization Complete',
							description: 'Infrastructure is fully operational.',
						}),

						// 3. Error Resolution with Retry Injection
						error: (err, retry) => ({
							title: 'Provisioning Anomaly',
							description:
								err instanceof Error
									? err.message
									: 'Unknown network failure occurred.',
							action: {
								label: 'Retry Connection',
								onClick: retry, // Maps directly to the recursive execute closure
							},
							cancel: {
								label: 'Dismiss',
								onClick: () => console.log('Failure acknowledged.'),
							},
						}),
					})
				}
				variant="secondary"
				size="lg"
			>
				Send Toast
			</Button>
		</div>
	);
};

export default overviewPage;
