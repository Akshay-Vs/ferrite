'use client';
import { useClerk } from '@clerk/nextjs';
import { useState } from 'react';
import { LOGIN } from '@/core/constants/routes.constants';
import { Button } from '@/presentation/primitives/button';
import { toast } from '@/presentation/primitives/sonner';
import { TabBar } from '@/presentation/primitives/tab-bar';

const OverviewPage = () => {
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

	const { signOut } = useClerk();
	const handleSubmission = () => {
		// 2. Pass the closure (not the executed promise) to the orchestrator
		toast.promise(initializeInfrastructure, {
			// Transient State
			loading: {
				title: 'Provisioning Infrastructure',
				description: 'Allocating database shards and initializing assets.',
			},

			// Resolution State
			success: (data) => ({
				title: 'Initialization Complete',
				description: `Successfully provisioned environment`,
			}),

			// Rejection State with Retry Injection
			error: (err, retry) => ({
				title: 'Provisioning Anomaly',
				description:
					err instanceof Error ? err.message : 'An unknown exception occurred.',
				// Conditionally render the retry action if the internal closure is provided
				action: retry
					? {
							label: 'Retry Allocation',
							onClick: retry,
						}
					: undefined,
				cancel: {
					label: 'Dismiss',
					onClick: () => console.log('Failure acknowledged by user.'),
				},
			}),
		});
	};

	return (
		<div className="full col-center gap-8 min-h-[87vh]">
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

			<Button onClick={handleSubmission} variant="secondary" size="lg">
				Send Toast
			</Button>

			<Button
				onClick={() => signOut({ redirectUrl: LOGIN })}
				variant="secondary"
				size="lg"
			>
				Logout
			</Button>
		</div>
	);
};

export default OverviewPage;
