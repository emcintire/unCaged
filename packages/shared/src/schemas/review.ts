import { z } from 'zod';

export const ReviewSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  movieId: z.string(),
  text: z.string(),
  rating: z.number().optional(),
  isSpoiler: z.boolean().optional(),
  likes: z.array(z.string()).default([]),
  likeCount: z.number(),
  isFlagged: z.boolean().optional(),
  isLikedByUser: z.boolean().optional(),
  createdOn: z.string(),
  userName: z.string(),
  userImg: z.string(),
});

export const ReviewsArraySchema = z.array(ReviewSchema);

export const ReviewsPageSchema = z.object({
  reviews: ReviewsArraySchema,
  total: z.number(),
  hasMore: z.boolean(),
});

export const UserReviewSchema = ReviewSchema.extend({
  movieTitle: z.string(),
  movieImg: z.string(),
});
export const UserReviewsArraySchema = z.array(UserReviewSchema);

export const AdminReviewSchema = ReviewSchema.extend({
  userEmail: z.string(),
  flaggedBy: z.array(z.string()).default([]),
  movieTitle: z.string(),
  movieImg: z.string(),
});
export const AdminReviewsPageSchema = z.object({
  reviews: z.array(AdminReviewSchema),
  total: z.number(),
  hasMore: z.boolean(),
});

export type Review = z.infer<typeof ReviewSchema>;
export type ReviewsPage = z.infer<typeof ReviewsPageSchema>;
export type UserReview = z.infer<typeof UserReviewSchema>;
export type AdminReview = z.infer<typeof AdminReviewSchema>;
export type AdminReviewsPage = z.infer<typeof AdminReviewsPageSchema>;
