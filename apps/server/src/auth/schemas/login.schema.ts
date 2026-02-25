import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';
import z from 'zod';

export const loginDtoSchema = z.object({
  email: z.email().min(1).max(255),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;
