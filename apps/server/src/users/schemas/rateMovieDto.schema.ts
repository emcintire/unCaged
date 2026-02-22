import z from 'zod';

export const rateMovieDtoSchema = z.object({ id: z.string(), rating: z.number().min(0).max(5) });

export type RateMovieDto = z.infer<typeof rateMovieDtoSchema>;
