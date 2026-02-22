import z from 'zod';

export const createQuoteDtoSchema = z.object({
  quote: z.string().min(1).max(255),
  subquote: z.string().min(1).max(255),
});

export type CreateQuoteDto = z.infer<typeof createQuoteDtoSchema>;
