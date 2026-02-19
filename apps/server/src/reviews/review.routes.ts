import express from 'express';
import { auth, admin } from '@/middleware';
import { ReviewController } from './review.controller';

export const reviewRouter = express.Router();
const controller = new ReviewController();

reviewRouter.get('/', controller.getReviewsByMovie.bind(controller));
reviewRouter.post('/', auth, controller.createReview.bind(controller));
reviewRouter.delete('/:reviewId', auth, controller.deleteReview.bind(controller));
reviewRouter.put('/:reviewId/like', auth, controller.toggleLike.bind(controller));
reviewRouter.post('/:reviewId/report', auth, controller.flagReview.bind(controller));

// Admin-only routes
reviewRouter.get('/admin', auth, admin, controller.getAllReviewsAdmin.bind(controller));
reviewRouter.put('/:reviewId/unflag', auth, admin, controller.unflagReview.bind(controller));
