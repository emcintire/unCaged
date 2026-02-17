import { z } from 'zod';

export const MovieSchema = z.object({
  _id: z.string(),
  avgRating: z.number().optional(),
  date: z.string(),
  description: z.string().optional(),
  director: z.string(),
  favoriteCount: z.number(),
  genres: z.array(z.string()),
  img: z.string(),
  rating: z.string(),
  ratingCount: z.number(),
  ratingSum: z.number(),
  runtime: z.string(),
  seenCount: z.number(),
  title: z.string(),
});

export type Movie = z.infer<typeof MovieSchema>;
