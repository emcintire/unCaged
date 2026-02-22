import z from 'zod';

export const createReviewDtoSchema = z.object({
  isSpoiler: z.boolean().optional().default(false),
  movieId: z.string().min(1).max(100),
  rating: z.number().min(0).max(5).optional(),
  text: z.string().max(512),
});

export type CreateReviewDto = z.infer<typeof createReviewDtoSchema>;
