import z from 'zod';
import { passwordRegex, passwordMessage } from '@/util';

export const updateUserSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email().min(1).max(255).optional(),
  img: z.string().min(1).max(100).optional(),
  password: z.string().regex(passwordRegex, passwordMessage).optional(),
  currentPassword: z.string().regex(passwordRegex, passwordMessage).optional(),
});
