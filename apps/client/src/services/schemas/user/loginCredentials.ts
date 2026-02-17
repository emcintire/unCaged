import { z } from 'zod';

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
