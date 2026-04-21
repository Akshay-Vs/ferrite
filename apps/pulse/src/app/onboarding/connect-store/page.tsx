'use client';

import FormHeading from '@/presentation/primitives/form-heading';

const OnboardingConnectStorePage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Connect Storefront to"
				highlightedText="Ferrite Core"
				description="Link your storefront to enable syncing and core features"
			/>
		</div>
	);
};

export default OnboardingConnectStorePage;
