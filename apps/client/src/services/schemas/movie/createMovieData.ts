import { z } from 'zod';

export const CreateMovieDataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  director: z.string().min(1, 'Director is required').max(100),
  description: z.string().max(512).optional().or(z.literal('')),
  genres: z.array(z.string()).optional(),
  runtime: z.string().min(1, 'Runtime is required').max(100),
  rating: z.string().min(1, 'Rating is required').max(100),
  date: z.string().min(1, 'Date is required').max(100),
  img: z.string().optional().or(z.literal('')),
});

export type CreateMovieData = z.infer<typeof CreateMovieDataSchema>;
