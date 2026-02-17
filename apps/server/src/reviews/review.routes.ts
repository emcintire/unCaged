import express from 'express';
import { auth } from '@/middleware';
import { ReviewController } from './review.controller';

export const reviewRouter = express.Router({ mergeParams: true });
const controller = new ReviewController();

reviewRouter.get('/', controller.getReviewsByMovie.bind(controller));
reviewRouter.post('/', auth, controller.createReview.bind(controller));
reviewRouter.delete('/:reviewId', auth, controller.deleteReview.bind(controller));
