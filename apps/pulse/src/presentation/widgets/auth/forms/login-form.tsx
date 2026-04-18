'use client';

import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod/v4';
import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/presentation/primitives/button';
import { Input } from '@/presentation/primitives/input';
import { PasswordInput } from '@/presentation/primitives/password-input';
import { FORGOT_PASSWORD, OVERVIEW, SIGNUP, VERIFY_EMAIL } from '@/core/constants/routes.constrains';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/presentation/primitives/field';
import ContinueWithSSO from '../sso/continue-with-sso';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[^A-Za-z0-9]/, 'Must include at least one special character.'),
});

export const LoginForm = () => {
  const router = useRouter();
  const { signIn, errors } = useSignIn();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted with values:', value);
      setFormError(null);

      // Step 1: Create the sign-in attempt with the identifier
      const createResult = await signIn.create({ identifier: value.email });
      if (createResult.error) {
        setFormError(createResult.error.message);
        return;
      }

      // Step 2: Submit the password
      const passwordResult = await signIn.password({ password: value.password });
      console.log('passwordResult', passwordResult);
      if (passwordResult.error) {
        setFormError(passwordResult.error.message);
        return;
      }

      // Step 3: Handle status after password verification
      if (signIn.status === 'needs_first_factor') {
        console.log('needs_first_factor');
        // First factor email code verification needed
        await signIn.emailCode.sendCode();
        router.push(VERIFY_EMAIL);
        return;
      }

      if (signIn.status === 'needs_second_factor') {
        console.log('needs_second_factor');
        // MFA email code verification needed
        await signIn.mfa.sendEmailCode();
        router.push(VERIFY_EMAIL);
        return;
      }

      if (signIn.status === 'complete') {
        console.log('complete');
        await signIn.finalize();
        router.push(OVERVIEW);
      }
    },
  });

  return (
    <div className="flex flex-col gap-12 flex-1 w-full h-full">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="email"
            children={(field) => {
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
          />

          <div className="col gap-2">
            <form.Field
              name="password"
              children={(field) => {
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
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <div className="w-full text-end px-2 text-base font-base text-content/95">
              <Link href={FORGOT_PASSWORD}>Forgot Password?</Link>
            </div>
          </div>
        </FieldGroup>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <div className="col gap-4 mt-2">
              {(formError || errors) && (
                <div className="text-destructive text-sm font-medium text-center bg-destructive/10 py-4 rounded-full">
                  {formError || errors.global?.[0]?.message || 'An error occurred during login.'}
                </div>
              )}
              <Button
                type="submit"
                disabled={!canSubmit || Boolean(isSubmitting)}
                className="w-full h-15 rounded-full font-normal text-base"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>

        <ContinueWithSSO />

        <p className="text-center text-base font-basetext-content/70">
          Don&apos;t have an account? <Link href={SIGNUP} className="underline underline-offset-2">Sign up</Link>
        </p>
    </div>
  );
};
