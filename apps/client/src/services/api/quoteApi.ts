import { makeApi } from '@zodios/core';
import { AddQuoteDataSchema, QuoteOrArraySchema, QuoteSchema } from '../schemas';

export const quoteApi = makeApi([
  {
    method: 'get',
    path: '/',
    alias: 'getQuote',
    response: QuoteOrArraySchema,
  },
  {
    method: 'post',
    path: '/',
    alias: 'addQuote',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: AddQuoteDataSchema,
      },
    ],
    response: QuoteSchema,
  },
]);
