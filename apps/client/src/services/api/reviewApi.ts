import { makeApi } from '@zodios/core';
import { z } from 'zod';
import { AdminReviewsPageSchema, ReviewsPageSchema } from '../schemas';

export const reviewApi = makeApi([
  {
    method: 'get',
    path: '/',
    alias: 'getReviewsByMovie',
    parameters: [
      { name: 'movieId', type: 'Query', schema: z.string() },
      { name: 'page', type: 'Query', schema: z.number().optional() },
      { name: 'limit', type: 'Query', schema: z.number().optional() },
      { name: 'sort', type: 'Query', schema: z.enum(['recent', 'popular']).optional() },
    ],
    response: ReviewsPageSchema,
  },
  {
    method: 'post',
    path: '/',
    alias: 'createReview',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          movieId: z.string(),
          text: z.string().min(1).max(2048),
          rating: z.number().min(0).max(5).optional(),
          isSpoiler: z.boolean().optional(),
        }),
      },
    ],
    response: z.unknown(),
  },
  {
    method: 'delete',
    path: '/:reviewId',
    alias: 'deleteReview',
    parameters: [
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.void(),
  },
  {
    method: 'put',
    path: '/:reviewId/like',
    alias: 'toggleReviewLike',
    parameters: [
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.object({ liked: z.boolean() }),
  },
  {
    method: 'post',
    path: '/:reviewId/report',
    alias: 'flagReview',
    parameters: [
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.void(),
  },
  {
    method: 'get',
    path: '/admin',
    alias: 'getAdminReviews',
    parameters: [
      { name: 'page', type: 'Query', schema: z.number().optional() },
      { name: 'limit', type: 'Query', schema: z.number().optional() },
      { name: 'flaggedOnly', type: 'Query', schema: z.boolean().optional() },
      { name: 'userEmail', type: 'Query', schema: z.string().optional() },
      { name: 'movieTitle', type: 'Query', schema: z.string().optional() },
    ],
    response: AdminReviewsPageSchema,
  },
  {
    method: 'put',
    path: '/:reviewId/unflag',
    alias: 'unflagReview',
    parameters: [
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.void(),
  },
]);
