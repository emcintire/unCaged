import { z } from 'zod';

export const reviewSchema = z.object({
  text: z.string().min(1).max(2048),
  rating: z.number().min(0).max(5).optional(),
  isSpoiler: z.boolean().optional(),
});

export type ReviewData = z.infer<typeof reviewSchema> & {
  userId: string;
  movieId: string;
  createdOn?: Date;
};
