import z from 'zod';

export const updateReviewDtoSchema = z.object({
  isSpoiler: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  text: z.string().max(512).optional(),
}).refine(
  (data) => data.text !== undefined || data.isSpoiler !== undefined || data.rating !== undefined,
  { message: 'At least one field must be provided' },
);

export type UpdateReviewDto = z.infer<typeof updateReviewDtoSchema>;
