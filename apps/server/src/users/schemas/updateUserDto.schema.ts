import z from 'zod';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';

export const updateUserDtoSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email().min(1).max(255).optional(),
  img: z.string().min(1).max(100).optional(),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE).optional(),
  currentPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>;
