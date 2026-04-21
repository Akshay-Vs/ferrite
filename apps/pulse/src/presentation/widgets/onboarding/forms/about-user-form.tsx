'use client';

import { Button } from '@/presentation/primitives/button';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/presentation/primitives/field';
import { Input } from '@/presentation/primitives/input';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/presentation/primitives/select';
import { useOnboardingUser } from '../hooks/use-onboarding-user';

const OnboardingAboutUserForm = () => {
	const { form, formError } = useOnboardingUser();

	return (
		<div className="flex flex-col w-full gap-10 flex-1 h-full">
			<form
				className="flex flex-col gap-6 w-full"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					{/* Full Name Field */}
					<form.Field name="fullName">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !!field.state.meta.errors.length;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name} className="ml-1">
										Full Name
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder="Enter Your Full Name"
										autoComplete="name"
										value={field.state.value ?? ''}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					{/* Profession Select Field */}
					<form.Field name="userProfession">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !!field.state.meta.errors.length;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel className="ml-1">
										Profession
										<span className="text-muted-foreground">(optional)</span>
									</FieldLabel>
									<Select
										value={field.state.value ?? ''}
										onValueChange={(val) => field.handleChange(val as any)}
									>
										<SelectTrigger
											className="w-full"
											aria-invalid={isInvalid}
											onBlur={field.handleBlur}
										>
											<SelectValue placeholder="Select your profession" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="Developer">Developer</SelectItem>
												<SelectItem value="Store Owner">Store Owner</SelectItem>
												<SelectItem value="Sales">Sales</SelectItem>
												<SelectItem value="Other">Other</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					{/* Referral Source Select Field */}
					<form.Field name="referralSource">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !!field.state.meta.errors.length;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel className="ml-1">
										How did you hear about us?
										<span className="text-muted-foreground">(optional)</span>
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={(val) => field.handleChange(val as any)}
									>
										<SelectTrigger
											className="w-full"
											aria-invalid={isInvalid}
											onBlur={field.handleBlur}
										>
											<SelectValue placeholder="Select a source" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="Google">Google</SelectItem>
												<SelectItem value="Facebook">Facebook</SelectItem>
												<SelectItem value="Twitter">Twitter</SelectItem>
												<SelectItem value="LinkedIn">LinkedIn</SelectItem>
												<SelectItem value="Other">Other</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</FieldGroup>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<div className="flex flex-col gap-4 mt-2 w-full">
							{formError && (
								<div className="text-destructive text-sm font-medium text-center bg-destructive/10 py-4 rounded-full">
									{formError}
								</div>
							)}
							<Button
								type="submit"
								disabled={!canSubmit}
								isLoading={isSubmitting}
								loadingText="Submitting..."
								className="w-full"
							>
								Continue
							</Button>
						</div>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
};

export default OnboardingAboutUserForm;
