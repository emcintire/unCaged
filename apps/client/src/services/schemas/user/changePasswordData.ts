import { z } from 'zod';

export const ChangePasswordDataSchema = z.object({
  password: z.string(),
});

export type ChangePasswordData = z.infer<typeof ChangePasswordDataSchema>;
