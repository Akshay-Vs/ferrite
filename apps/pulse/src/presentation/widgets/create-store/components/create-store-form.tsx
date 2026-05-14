'use client';

import { cn } from '@/core/utils/cn';
import { Button } from '@/presentation/primitives/button';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/presentation/primitives/field';
import { Input } from '@/presentation/primitives/input';
import { Textarea } from '@/presentation/primitives/textarea';
import type { CreateStoreFormApi } from '../hooks/use-create-store-form';

export type CreateStoreFormVariant = 'page' | 'dialog';

type CreateStoreFormProps = {
	form: CreateStoreFormApi;
	variant?: CreateStoreFormVariant;
	submitLabel?: string;
};

export function CreateStoreForm({
	form,
	variant = 'page',
	submitLabel = 'Next',
}: CreateStoreFormProps) {
	const isDialog = variant === 'dialog';

	return (
		<form
			className={cn('flex w-full flex-col gap-6')}
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<FieldGroup className={cn(isDialog && 'gap-8')}>
				<form.Field name="name">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel
									htmlFor={field.name}
									className={cn(isDialog && 'font-normal text-base')}
								>
									Store name
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter store name"
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="description">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !!field.state.meta.errors.length;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel
									htmlFor={field.name}
									className={cn(isDialog && 'font-normal text-base')}
								>
									Description
								</FieldLabel>
								<Textarea
									id={field.name}
									name={field.name}
									value={field.state.value ?? ''}
									onBlur={field.handleBlur}
									onChange={(e) => {
										const v = e.target.value;
										field.handleChange(v === '' ? undefined : v);
									}}
									placeholder="Briefly describe your store (optional)"
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<form.Subscribe selector={(state) => [state.canSubmit]}>
				{([canSubmit]) => (
					<Button
						type="submit"
						variant="secondary"
						disabled={!canSubmit}
						className={cn('w-full', isDialog ? 'mt-2' : 'mt-4')}
					>
						{submitLabel}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
