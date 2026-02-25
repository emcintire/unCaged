import { z } from 'zod';

import { DEFAULT_USER_IMG } from '@/utils';

export const userSchema = z.object({
  createdOn: z.date().default(() => new Date()),
  email: z.email().min(1).max(255),
  favorites: z.array(z.string()).default([]),
  image: z.number().int().min(1).max(6).default(1),
  img: z.string().max(100).default(DEFAULT_USER_IMG),
  isAdmin: z.boolean().default(false),
  name: z.string().max(100).optional(),
  password: z.string().min(5).max(1024),
  ratings: z.array(z.object({ movie: z.string(), rating: z.number() })).default([]),
  resetCode: z.string().max(100).optional(),
  resetCodeExpiry: z.date().optional(),
  seen: z.array(z.string()).default([]),
  watchlist: z.array(z.string()).default([]),
});

export type UserData = z.infer<typeof userSchema>;
