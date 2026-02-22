import { z } from 'zod';

export const reviewSchema = z.object({
  createdOn: z.date().default(() => new Date()),
  isSpoiler: z.boolean().default(false),
  movieId: z.string().min(1).max(100),
  rating: z.number().min(0).max(5).optional(),
  text: z.string().max(512),
  userId: z.string().min(1).max(100),
});

export type ReviewData = z.infer<typeof reviewSchema>;
