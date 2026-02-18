import { makeApi } from '@zodios/core';
import { z } from 'zod';
import {
  AddQuoteDataSchema,
  AverageRatingSchema,
  CreateMovieDataSchema,
  FilteredMoviesDataSchema,
  MoviesArraySchema,
  MovieSchema,
  QuoteOrArraySchema,
  QuoteSchema,
  ReviewsPageSchema,
  SearchMovieDataSchema,
} from '../schemas';

export const movieApi = makeApi([
  {
    method: 'post',
    path: '/getMovies',
    alias: 'getMovies',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}),
      },
    ],
    response: MoviesArraySchema,
  }, {
    method: 'get',
    path: '/avgRating/:id',
    alias: 'getAverageRating',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: AverageRatingSchema,
  }, {
    method: 'get',
    path: '/quote',
    alias: 'getQuote',
    response: QuoteOrArraySchema,
  }, {
    method: 'post',
    path: '/quote',
    alias: 'addQuote',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: AddQuoteDataSchema,
      },
    ],
    response: QuoteSchema,
  },   {
    method: 'post',
    path: '/filteredMovies',
    alias: 'getFilteredMovies',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: FilteredMoviesDataSchema,
      },
    ],
    response: MoviesArraySchema,
  }, {
    method: 'get',
    path: '/popular',
    alias: 'getPopularMovies',
    response: MoviesArraySchema,
  }, {
    method: 'get',
    path: '/staffpicks',
    alias: 'getStaffPicks',
    response: MoviesArraySchema,
  }, {
    method: 'post',
    path: '/findByTitle',
    alias: 'searchMovies',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SearchMovieDataSchema,
      },
    ],
    response: MoviesArraySchema,
  }, {
    method: 'post',
    path: '/',
    alias: 'createMovie',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CreateMovieDataSchema,
      },
    ],
    response: MovieSchema,
  }, {
    method: 'get',
    path: '/:movieId/reviews',
    alias: 'getReviewsByMovie',
    parameters: [
      { name: 'movieId', type: 'Path', schema: z.string() },
      { name: 'page', type: 'Query', schema: z.number().optional() },
      { name: 'limit', type: 'Query', schema: z.number().optional() },
      { name: 'sort', type: 'Query', schema: z.enum(['recent', 'popular']).optional() },
    ],
    response: ReviewsPageSchema,
  }, {
    method: 'post',
    path: '/:movieId/reviews',
    alias: 'createReview',
    parameters: [
      { name: 'movieId', type: 'Path', schema: z.string() },
      {
        name: 'body',
        type: 'Body',
        schema: z.object({
          text: z.string().min(1).max(2048),
          rating: z.number().min(0).max(5).optional(),
          isSpoiler: z.boolean().optional(),
        }),
      },
    ],
    response: z.unknown(),
  }, {
    method: 'delete',
    path: '/:movieId/reviews/:reviewId',
    alias: 'deleteReview',
    parameters: [
      { name: 'movieId', type: 'Path', schema: z.string() },
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.void(),
  }, {
    method: 'put',
    path: '/:movieId/reviews/:reviewId/like',
    alias: 'toggleReviewLike',
    parameters: [
      { name: 'movieId', type: 'Path', schema: z.string() },
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.object({ liked: z.boolean() }),
  }, {
    method: 'post',
    path: '/:movieId/reviews/:reviewId/report',
    alias: 'flagReview',
    parameters: [
      { name: 'movieId', type: 'Path', schema: z.string() },
      { name: 'reviewId', type: 'Path', schema: z.string() },
    ],
    response: z.void(),
  },
]);
