import z from 'zod';

export const movieRatingSchema = z.object({ id: z.string(), rating: z.number() })
