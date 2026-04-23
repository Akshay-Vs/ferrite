'use client';

import FormHeading from '@/presentation/primitives/form-heading';
import ConnectStoreForm from '@/presentation/widgets/onboarding/forms/connect-store-form';

const OnboardingConnectStorePage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Connect Your"
				highlightedText="Storefront"
				description="Link your storefront to Ferrite core"
			/>

			<ConnectStoreForm />
		</div>
	);
};

export default OnboardingConnectStorePage;
