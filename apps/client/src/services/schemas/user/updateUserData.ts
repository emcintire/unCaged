import { z } from 'zod';

export const UpdateUserImageDataSchema = z.object({
  img: z.string(),
});

export const UpdateUserDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  img: z.string().optional(),
});

export type UpdateUserImageData = z.infer<typeof UpdateUserImageDataSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserDataSchema>;
