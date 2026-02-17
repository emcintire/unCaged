import { z } from 'zod';

export const DeleteRatingDataSchema = z.object({
  id: z.string(),
});

export type DeleteRatingData = z.infer<typeof DeleteRatingDataSchema>;
