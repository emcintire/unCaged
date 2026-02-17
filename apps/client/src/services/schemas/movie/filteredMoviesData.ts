import { z } from 'zod';

export const FilteredMoviesDataSchema = z.object({
  seen: z.boolean(),
  rotten: z.boolean(),
  time: z.number(),
  genres: z.array(z.string()),
  min: z.number(),
  max: z.number(),
});

export type FilteredMoviesData = z.infer<typeof FilteredMoviesDataSchema>;
