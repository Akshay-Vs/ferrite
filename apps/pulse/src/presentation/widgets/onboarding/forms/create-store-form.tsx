'use client';

import { CreateStoreForm } from '@/presentation/widgets/create-store/components/create-store-form';
import { useOnboardingCreateStore } from '../hooks/use-onboarding-create-store';

export default function OnboardingCreateStoreForm() {
	const { form } = useOnboardingCreateStore();
	return <CreateStoreForm form={form} variant="page" />;
}
