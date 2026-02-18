import { makeApi } from '@zodios/core';
import { z } from 'zod';
import { AdminReviewsPageSchema } from '../schemas';

export const adminApi = makeApi([
  {
    method: 'get',
    path: '/reviews',
    alias: 'getAdminReviews',
    parameters: [
      { name: 'page', type: 'Query', schema: z.number().optional() },
      { name: 'limit', type: 'Query', schema: z.number().optional() },
      { name: 'flaggedOnly', type: 'Query', schema: z.boolean().optional() },
      { name: 'userId', type: 'Query', schema: z.string().optional() },
      { name: 'movieId', type: 'Query', schema: z.string().optional() },
    ],
    response: AdminReviewsPageSchema,
  }, {
    method: 'put',
    path: '/reviews/:reviewId/unflag',
    alias: 'unflagReview',
    parameters: [
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.void(),
  }, {
    method: 'delete',
    path: '/reviews/:reviewId',
    alias: 'adminDeleteReview',
    parameters: [
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.void(),
  },
]);
