import { z } from 'zod';

export const ForgotPasswordDataSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordData = z.infer<typeof ForgotPasswordDataSchema>;
