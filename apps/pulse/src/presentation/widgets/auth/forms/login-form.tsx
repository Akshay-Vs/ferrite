'use client';

import Link from 'next/link';
import { FORGOT_PASSWORD } from '@/core/constants/routes.constrains';
import { Button } from '@/presentation/primitives/button';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/presentation/primitives/field';
import { Input } from '@/presentation/primitives/input';
import { PasswordInput } from '@/presentation/primitives/password-input';
import ContinueWithSSO from '../components/continue-with-sso';
import { RedirectToSignup } from '../components/form-redirect';
import { useLoginForm } from '../hooks/use-login';

export const LoginForm = () => {
	const { form, formError } = useLoginForm();

	return (
		<div className="flex flex-col gap-10 flex-1 w-full h-full">
			<form
				className="flex flex-col gap-6"
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<form.Field name="email">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name} className="ml-1">
										Email
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										placeholder="youremail@example.com"
										type="email"
										autoComplete="email"
										className="w-full"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<div className="col gap-2">
						<form.Field name="password">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name} className="ml-1">
											Password
										</FieldLabel>
										<PasswordInput
											id={field.name}
											name={field.name}
											placeholder="********"
											className="w-full placeholder:tracking-[0.2rem] placeholder:leading-tight"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											autoComplete="current-password"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<div className="w-full text-end px-2 text-base font-base text-content/95 hover:underline underline-offset-2">
							<Link href={FORGOT_PASSWORD}>Forgot Password?</Link>
						</div>
					</div>
				</FieldGroup>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<div className="col gap-4 mt-2">
							{formError && (
								<div className="text-destructive text-sm font-medium text-center bg-destructive/10 py-4 rounded-full">
									{formError}
								</div>
							)}
							<Button
								type="submit"
								disabled={!canSubmit}
								isLoading={isSubmitting}
								loadingText="Logging in..."
								className="w-full"
							>
								Login
							</Button>
						</div>
					)}
				</form.Subscribe>
			</form>

			<div id="clerk-captcha" />

			<ContinueWithSSO />
			<RedirectToSignup />
		</div>
	);
};
