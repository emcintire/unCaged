import { z } from 'zod';

export const SearchMovieDataSchema = z.object({
  search: z.string(),
});

export type SearchMovieData = z.infer<typeof SearchMovieDataSchema>;
