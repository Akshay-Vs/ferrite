'use client';

import FormHeading from '@/presentation/primitives/form-heading';
import OnboardingCreateStoreForm from '@/presentation/widgets/onboarding/forms/create-store-form';

const OnboardingCreateStorePage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Create Your"
				highlightedText="First Store"
				description="Set up your store to start building your storefront"
			/>

			<OnboardingCreateStoreForm />
		</div>
	);
};

export default OnboardingCreateStorePage;
