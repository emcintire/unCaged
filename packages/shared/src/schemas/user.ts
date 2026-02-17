import { z } from 'zod';
import { UserRatingSchema } from './userRating';

export const UserSchema = z.object({
  __v: z.number(),
  _id: z.string(),
  createdOn: z.string(),
  email: z.string(),
  favorites: z.array(z.string()),
  img: z.string(),
  isAdmin: z.boolean(),
  name: z.string().optional(),
  password: z.string(),
  ratings: z.array(UserRatingSchema),
  resetCode: z.string(),
  seen: z.array(z.string()),
  watchlist: z.array(z.string()),
});

export type User = z.infer<typeof UserSchema>;
