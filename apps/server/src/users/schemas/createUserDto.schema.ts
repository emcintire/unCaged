import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';
import { z } from 'zod';

export const createUserDtoSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email().min(1).max(255),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

export type CreateUserDto = z.infer<typeof createUserDtoSchema>;
