'use client';

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
import { useOnboardingStoreConfigure } from '../hooks/use-onboarding-config-store';
import { CURRENCY_OPTIONS } from '../schemas/onboarding-store.zodschema';

export default function OnboardingConfigureStoreForm() {
	const { form, isSubmittingToAPI } = useOnboardingStoreConfigure();
	return (
		<form
			className="flex w-full flex-col gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<FieldGroup>
				<form.Field name="storeCurrency">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel className="ml-1">Operating Currency</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(val) => field.handleChange(val as any)}
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
				<form.Field name="StoreIcon">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel className="ml-1">Store Icon</FieldLabel>
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

			<div className="flex gap-4 mt-4 w-full">
				<form.Subscribe selector={(state) => [state.canSubmit]}>
					{([canSubmit]) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmittingToAPI}
							isLoading={isSubmittingToAPI}
							className="w-full"
						>
							Next
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
