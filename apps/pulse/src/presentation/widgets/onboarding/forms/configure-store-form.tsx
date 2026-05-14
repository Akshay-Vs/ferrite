'use client';

import { ConfigureStoreForm } from '@/presentation/widgets/create-store/components/configure-store-form';
import { useOnboardingStoreConfigure } from '../hooks/use-onboarding-config-store';

export default function OnboardingConfigureStoreForm() {
	const { form, isPending } = useOnboardingStoreConfigure();
	return (
		<ConfigureStoreForm form={form} isPending={isPending} variant="page" />
	);
}
