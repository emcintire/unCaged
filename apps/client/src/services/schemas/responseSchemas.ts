import { z } from 'zod';
import { MovieSchema, QuoteSchema } from './movie';

export const TokenResponseSchema = z.string();
export const MoviesArraySchema = z.array(MovieSchema);
export const QuoteOrArraySchema = z.union([QuoteSchema, z.array(QuoteSchema)]);
export const AverageRatingSchema = z.string();

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type MoviesArray = z.infer<typeof MoviesArraySchema>;
export type QuoteOrArray = z.infer<typeof QuoteOrArraySchema>;
export type AverageRating = z.infer<typeof AverageRatingSchema>;
