import { z } from 'zod';

export const quoteSchema = z.object({
  quote: z.string().min(1).max(255),
  subquote: z.string().min(1).max(128),
  createdOn: z.date().optional(),
});

export type QuoteData = z.infer<typeof quoteSchema>;
