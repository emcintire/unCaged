import { z } from 'zod';

export const UserRatingSchema = z.object({
  _id: z.string(),
  movie: z.string(),
  rating: z.number(),
});

export type UserRating = z.infer<typeof UserRatingSchema>;
