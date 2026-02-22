import z from 'zod';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';

export const loginSchema = z.object({
  email: z.email().min(1).max(255),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});
