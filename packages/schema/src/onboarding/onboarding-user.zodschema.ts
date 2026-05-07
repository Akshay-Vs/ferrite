import { z } from 'zod/v4';

export const onboardingAboutUserSchema = z.object({
	firstName: z.string().min(1, { message: 'First name is required' }).max(150),
	lastName: z.string().min(1, { message: 'Last name is required' }).max(150),
	userProfession: z
		.enum(['Developer', 'Store Owner', 'Sales', 'Other'])
		.optional(),
	referralSource: z
		.enum(['Google', 'Facebook', 'Twitter', 'LinkedIn', 'Other'])
		.optional(),
});
export type OnboardingAboutUser = z.infer<typeof onboardingAboutUserSchema>;
