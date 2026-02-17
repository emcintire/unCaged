import { z } from 'zod';

export const AddQuoteDataSchema = z.object({
  quote: z.string(),
  subquote: z.string(),
});

export type AddQuoteData = z.infer<typeof AddQuoteDataSchema>;
