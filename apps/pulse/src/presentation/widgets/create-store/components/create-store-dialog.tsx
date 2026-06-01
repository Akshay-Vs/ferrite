'use client';

import { HousePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/presentation/primitives/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/presentation/primitives/dialog';
import { ConfigureStoreForm } from '@/presentation/widgets/create-store/components/configure-store-form';
import { CreateStoreForm } from '@/presentation/widgets/create-store/components/create-store-form';
import { useCreateStoreDialogConfigure } from '@/presentation/widgets/create-store/hooks/use-create-store-dialog-configure';
import type { CreateStoreFormValues } from '@/presentation/widgets/create-store/hooks/use-create-store-form';
import { useCreateStoreForm } from '@/presentation/widgets/create-store/hooks/use-create-store-form';

type DialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type TriggerProps = {
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const emptyDraft = (): CreateStoreFormValues => ({
	name: '',
	description: undefined,
});

export const CreateStoreButton = ({ onClick }: TriggerProps) => (
	<Button onClick={onClick} variant="ghost">
		<HousePlus />
		Create New Store
	</Button>
);

function DialogStepDetails({
	initialDraft,
	onContinue,
}: {
	initialDraft: CreateStoreFormValues;
	onContinue: (value: CreateStoreFormValues) => void;
}) {
	const form = useCreateStoreForm({
		defaultValues: initialDraft,
		onSubmit: async (value) => {
			onContinue(value);
		},
	});
	return (
		<CreateStoreForm form={form} variant="dialog" submitLabel="Continue" />
	);
}

function DialogStepConfigure({
	step1,
	onSuccess,
	onBack,
}: {
	step1: CreateStoreFormValues;
	onSuccess: () => void;
	onBack: () => void;
}) {
	const { form, isPending } = useCreateStoreDialogConfigure({
		step1,
		onCompleted: onSuccess,
		onInvalidPayload: onBack,
	});
	return (
		<ConfigureStoreForm
			form={form}
			isPending={isPending}
			variant="dialog"
			submitLabel="Create store"
			onBack={onBack}
		/>
	);
}

const CreateStoreDialog = ({ open, onOpenChange }: DialogProps) => {
	const [step, setStep] = useState<1 | 2>(1);
	const [draft, setDraft] = useState<CreateStoreFormValues>(emptyDraft);
	const [dialogSession, setDialogSession] = useState(0);

	useEffect(() => {
		if (!open) {
			setStep(1);
			setDraft(emptyDraft());
			return;
		}
		setDialogSession((n) => n + 1);
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-[32.5rem] sm:max-w-[32.5rem]">
				{step === 1 ? (
					<div className="flex flex-col gap-10">
						<DialogHeader>
							<DialogTitle className="text-center font-light text-3xl">
								Create store
							</DialogTitle>
							<DialogDescription className="text-center">
								Name your store and add an optional description.
							</DialogDescription>
						</DialogHeader>
						<DialogStepDetails
							key={dialogSession}
							initialDraft={draft}
							onContinue={(value) => {
								setDraft(value);
								setStep(2);
							}}
						/>
					</div>
				) : (
					<div className="flex flex-col gap-12">
						<DialogHeader>
							<DialogTitle className="text-center font-light text-3xl">
								Configure store
							</DialogTitle>
							<DialogDescription className="text-center">
								Choose currency and an icon for your storefront.
							</DialogDescription>
						</DialogHeader>
						<DialogStepConfigure
							step1={draft}
							onSuccess={() => onOpenChange(false)}
							onBack={() => setStep(1)}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default CreateStoreDialog;
