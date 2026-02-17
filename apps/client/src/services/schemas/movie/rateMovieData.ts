import { z } from 'zod';

export const RateMovieDataSchema = z.object({
  id: z.string(),
  rating: z.number(),
});

export type RateMovieData = z.infer<typeof RateMovieDataSchema>;
