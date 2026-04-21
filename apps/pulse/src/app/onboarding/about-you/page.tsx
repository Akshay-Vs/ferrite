'use client';

import FormHeading from '@/presentation/primitives/form-heading';
import OnboardingAboutUserForm from '@/presentation/widgets/onboarding/forms/about-user-form';

const OnboardingAboutYouPage = () => {
	return (
		<div className="flex flex-col items-stretch gap-16 w-full">
			<FormHeading
				title="Tell Us"
				highlightedText="About You"
				description="A few quick details to get started"
			/>

			<OnboardingAboutUserForm />
		</div>
	);
};

export default OnboardingAboutYouPage;
