import { CURRENCY_OPTIONS } from '@ferrite/schema';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { Button } from '@/presentation/primitives/button';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/presentation/primitives/field';
import { IconSelector } from '@/presentation/primitives/icon-selector';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/presentation/primitives/select';
import type { CreateStoreDialogConfigureFormApi } from '@/presentation/widgets/create-store/hooks/use-create-store-dialog-configure';
import type { OnboardingConfigureFormApi } from '@/presentation/widgets/onboarding/hooks/use-onboarding-config-store';

export type ConfigureStoreFormVariant = 'page' | 'dialog';

type StoreConfigureFormApi =
	| OnboardingConfigureFormApi
	| CreateStoreDialogConfigureFormApi;

type ConfigureStoreFormProps = {
	form: StoreConfigureFormApi;
	isPending: boolean;
	variant?: ConfigureStoreFormVariant;
	submitLabel?: string;
	onBack?: () => void;
};

export function ConfigureStoreForm({
	form,
	isPending,
	variant = 'page',
	submitLabel = 'Next',
	onBack,
}: ConfigureStoreFormProps) {
	const isDialog = variant === 'dialog';

	return (
		<form
			className={cn('flex w-full flex-col gap-8')}
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<FieldGroup className={cn(isDialog && 'gap-8')}>
				<form.Field name="currencyCode">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel className={cn(isDialog && 'font-normal text-base')}>
									Operating currency
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(val) => field.handleChange(val as string)}
								>
									<SelectTrigger
										className="w-full"
										aria-invalid={isInvalid}
										onBlur={field.handleBlur}
									>
										<SelectValue placeholder="Select currency" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{CURRENCY_OPTIONS.map((currency) => (
												<SelectItem key={currency.value} value={currency.value}>
													{currency.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
				<form.Field name="storeIcon">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel className={cn(isDialog && 'font-normal text-base')}>
									Store icon
								</FieldLabel>
								<IconSelector
									value={field.state.value}
									onChange={(val) => field.handleChange(val)}
									onBlur={field.handleBlur}
									aria-invalid={isInvalid}
								/>
								{isInvalid && (
									<FieldError
										className="mt-2"
										errors={field.state.meta.errors}
									/>
								)}
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<div
				className={cn(
					'flex w-full gap-4',
					isDialog ? 'mt-2 flex-col-reverse sm:flex-row' : 'mt-4'
				)}
			>
				{onBack && (
					<Button
						type="button"
						className="w-36 group"
						disabled={isPending}
						onClick={onBack}
						tooltip="Back"
						aria-label="Back"
					>
						<ArrowLeft
							aria-hidden="true"
							className="size-5! transition-transform duration-200 group-hover:-translate-x-1"
						/>
						<span className="sr-only">Back</span>
					</Button>
				)}
				<form.Subscribe selector={(state) => [state.canSubmit]}>
					{([canSubmit]) => (
						<Button
							type="submit"
							variant="secondary"
							disabled={!canSubmit || isPending}
							isLoading={isPending}
							className={cn('w-full', onBack && 'sm:flex-1')}
						>
							{submitLabel}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
