'use client';

import FormHeading from '@/presentation/primitives/form-heading';
import OnboardingConfigureStoreForm from '@/presentation/widgets/onboarding/forms/configure-store-form';

const OnboardingConfigureStorePage = () => {
	return (
		<div className="flex flex-col items-center gap-16 w-full">
			<FormHeading
				title="Configure Your"
				highlightedText="Store"
				description="Configure basic store settings"
			/>

			<OnboardingConfigureStoreForm />
		</div>
	);
};

export default OnboardingConfigureStorePage;
