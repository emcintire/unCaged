import express from 'express';
import { auth, admin } from '@/middleware';
import { ReviewController } from './review.controller';

export const adminReviewRouter = express.Router();
const controller = new ReviewController();

adminReviewRouter.use(auth, admin);
adminReviewRouter.get('/', controller.getAllReviewsAdmin.bind(controller));
adminReviewRouter.put('/:reviewId/unflag', controller.unflagReview.bind(controller));
adminReviewRouter.delete('/:reviewId', controller.deleteReviewAdmin.bind(controller));
