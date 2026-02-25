import z from 'zod';
import { PASSWORD_ERROR_MESSAGE, PASSWORD_REGEX } from '@uncaged/shared';

export const changePasswordDtoSchema = z.object({
  currentPassword: z.string().min(1),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE),
});

export type ChangePasswordDto = z.infer<typeof changePasswordDtoSchema>;
