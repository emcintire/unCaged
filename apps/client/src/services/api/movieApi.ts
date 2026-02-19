import { makeApi } from '@zodios/core';
import { z } from 'zod';
import {
  AverageRatingSchema,
  CreateMovieDataSchema,
  FilteredMoviesDataSchema,
  MoviesArraySchema,
  MovieSchema,
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
  },
]);
