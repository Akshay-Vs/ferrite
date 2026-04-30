import { z } from 'zod/v4';

/**
 * Input schema for the "About Me" onboarding step.
 *
 * Captures the user's first and last name. The frontend's `fullName`
 * field is split by the client before submission.
 */
export const submitAboutMeSchema = z.object({
	firstName: z.string().min(1).max(100),
	lastName: z.string().min(1).max(100),
});

export type SubmitAboutMeInput = z.infer<typeof submitAboutMeSchema>;
