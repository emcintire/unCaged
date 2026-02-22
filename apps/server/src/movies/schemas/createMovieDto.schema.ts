import { z } from 'zod';

export const createMovieDtoSchema = z.object({
  date: z.string().min(1).max(50),
  description: z.string().max(512),
  director: z.string().min(1).max(100),
  genres: z.array(z.string()).default([]),
  img: z.string().max(100),
  rating: z.string().min(1).max(20),
  runtime: z.string().min(1).max(20),
  title: z.string().min(1).max(100),
});

export type CreateMovieDto = z.infer<typeof createMovieDtoSchema>;
