import { z } from 'zod/v4';

export const onboardingUserSchema = z.object({
	fullName: z
		.string()
		.min(1, { error: 'Full name is required' })
		.max(50)
		.refine(
			(value) => {
				const nameParts = value.trim().split(/\s+/);
				return (
					nameParts.length >= 2 && nameParts.every((part) => part.length > 0)
				);
			},
			{ message: 'Please enter at least both your first and last name' }
		),
	userProfession: z
		.enum(['Developer', 'Store Owner', 'Sales', 'Other'])
		.optional(),
	referralSource: z
		.enum(['Google', 'Facebook', 'Twitter', 'LinkedIn', 'Other'])
		.optional(),
});
export type OnboardingUser = z.infer<typeof onboardingUserSchema>;
