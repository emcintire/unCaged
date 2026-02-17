import { z } from 'zod';

export const ReviewSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  movieId: z.string(),
  text: z.string(),
  rating: z.number().optional(),
  isSpoiler: z.boolean().optional(),
  createdOn: z.string(),
  userName: z.string(),
  userImg: z.string(),
});

export type Review = z.infer<typeof ReviewSchema>;
