import z from 'zod';

export const userRatingSchema = z.object({
  movie: z.string(),
  rating: z.number(),
});
