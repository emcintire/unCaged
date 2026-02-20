import { z } from 'zod';

export const movieSchema = z.object({
  avgRating: z.number().min(0).max(10).default(0),
  ratingCount: z.number().default(0),
  ratingSum: z.number().default(0),
  seenCount: z.number().default(0),
  favoriteCount: z.number().default(0),
  title: z.string().min(1).max(100),
  director: z.string().min(1).max(100),
  description: z.string().max(512).optional(),
  date: z.string().min(1).max(100),
  runtime: z.string().min(1).max(100),
  rating: z.string().min(1).max(100),
  img: z.string().max(100).optional(),
  genres: z.array(z.string()).optional().default([]),
});

export type MovieData = z.infer<typeof movieSchema>;
