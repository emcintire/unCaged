import express from 'express';
import { auth, admin } from '@/middleware';
import { QuoteController } from './quote.controller';

export const quoteRouter = express.Router();
const controller = new QuoteController();

quoteRouter.get('/', controller.getQuote.bind(controller));
quoteRouter.post('/', auth, admin, controller.createQuote.bind(controller));
