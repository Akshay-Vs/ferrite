'use client';

import FormHeading from '@/presentation/primitives/form-heading';

const OnboardingConnectStorePage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Connect Your"
				highlightedText="Storefront"
				description="Link your storefront to Ferrite core"
			/>
		</div>
	);
};

export default OnboardingConnectStorePage;
