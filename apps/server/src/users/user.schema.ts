import { z } from 'zod';
import { userRatingSchema } from './userRating.schema';

export const userSchema = z.object({
  createdOn: z.date().default(() => new Date()),
  email: z.email().min(1).max(255),
  favorites: z.array(z.string()).default([]),
  img: z.string().default(''),
  isAdmin: z.boolean().default(false),
  name: z.string().min(1).max(100).optional().default(''),
  password: z.string().min(5).max(1024),
  ratings: z.array(userRatingSchema).default([]),
  resetCode: z.string().max(100).default(''),
  resetCodeExpiry: z.date().optional(),
  seen: z.array(z.string()).default([]),
  watchlist: z.array(z.string()).default([]),
});

export type UserData = z.infer<typeof userSchema>;
