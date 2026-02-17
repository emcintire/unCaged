import { makeApi } from '@zodios/core';
import { z } from 'zod';
import {
  ChangePasswordDataSchema,
  CheckCodeDataSchema,
  DeleteRatingDataSchema,
  DeleteUserDataSchema,
  ForgotPasswordDataSchema,
  IdSchema,
  LoginCredentialsSchema,
  MoviesArraySchema,
  RateMovieDataSchema,
  RegisterDataSchema,
  TokenResponseSchema,
  UpdateUserDataSchema,
  UserSchema,
} from '../schemas';

export const userApi = makeApi([
  {
    method: 'get',
    path: '/',
    alias: 'getCurrentUser',
    response: UserSchema,
  }, {
    method: 'put',
    path: '/',
    alias: 'updateUser',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UpdateUserDataSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'post',
    path: '/',
    alias: 'register',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: RegisterDataSchema,
      },
    ],
    response: TokenResponseSchema,
  }, {
    method: 'delete',
    path: '/',
    alias: 'deleteUser',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: DeleteUserDataSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'get',
    path: '/watchlist',
    alias: 'getWatchlist',
    response: MoviesArraySchema,
  }, {
    method: 'get',
    path: '/favorites',
    alias: 'getFavorites',
    response: MoviesArraySchema,
  }, {
    method: 'get',
    path: '/seen',
    alias: 'getSeen',
    response: MoviesArraySchema,
  }, {
    method: 'get',
    path: '/rate',
    alias: 'getRatings',
    response: MoviesArraySchema,
  }, {
    method: 'post',
    path: '/login',
    alias: 'login',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: LoginCredentialsSchema,
      },
    ],
    response: TokenResponseSchema,
  }, {
    method: 'post',
    path: '/forgotpassword',
    alias: 'forgotPassword',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ForgotPasswordDataSchema,
      },
    ],
    response: TokenResponseSchema,
  }, {
    method: 'post',
    path: '/checkcode',
    alias: 'checkCode',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: CheckCodeDataSchema,
      },
    ],
    response: z.object({ message: z.string() }),
  }, {
    method: 'put',
    path: '/changepassword',
    alias: 'changePassword',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ChangePasswordDataSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'put',
    path: '/watchlist',
    alias: 'addToWatchlist',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: IdSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'delete',
    path: '/watchlist',
    alias: 'removeFromWatchlist',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: IdSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'put',
    path: '/favorites',
    alias: 'addToFavorites',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: IdSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'delete',
    path: '/favorites',
    alias: 'removeFromFavorites',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: IdSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'put',
    path: '/seen',
    alias: 'addToSeen',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: IdSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'put',
    path: '/rate',
    alias: 'rateMovie',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: RateMovieDataSchema,
      },
    ],
    response: TokenResponseSchema,
  }, {
    method: 'delete',
    path: '/seen',
    alias: 'removeFromSeen',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: IdSchema,
      },
    ],
    response: z.void(),
  }, {
    method: 'delete',
    path: '/rate',
    alias: 'deleteRating',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: DeleteRatingDataSchema,
      },
    ],
    response: z.void(),
  },
]);
