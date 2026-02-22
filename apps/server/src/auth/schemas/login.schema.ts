import z from 'zod';
import { passwordMessage, passwordRegex } from '@/util';

export const loginSchema = z.object({
  email: z.email().min(1).max(100),
  password: z.string().regex(passwordRegex, passwordMessage),
});
