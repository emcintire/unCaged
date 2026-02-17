import { z } from 'zod';

export const DeleteUserDataSchema = z.object({
  id: z.string(),
});

export type DeleteUserData = z.infer<typeof DeleteUserDataSchema>;
