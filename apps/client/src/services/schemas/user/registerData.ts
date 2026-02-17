import { z } from 'zod';

export const RegisterDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string(),
});

export type RegisterData = z.infer<typeof RegisterDataSchema>;
