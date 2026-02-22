import express from 'express';
import { auth, admin } from '@/middleware';
import { ReviewController } from './review.controller';

export const adminReviewRouter = express.Router();
const controller = new ReviewController();

adminReviewRouter.use(auth, admin);
adminReviewRouter.get('/', controller.getAllReviewsAdmin);
adminReviewRouter.put('/:reviewId/unflag', controller.unflagReview);
adminReviewRouter.delete('/:reviewId', controller.deleteReviewAdmin);
