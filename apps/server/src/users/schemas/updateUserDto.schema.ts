import z from 'zod';

export const updateUserDtoSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email().min(1).max(255).optional(),
  image: z.number().int().min(1).max(6).optional(),
  img: z.string().min(1).max(100).optional(), // kept for old iOS client
});

export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>;
