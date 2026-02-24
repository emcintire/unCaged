import express from 'express';
import { auth, admin } from '@/middleware';
import { ReviewController } from './review.controller';

export const reviewRouter = express.Router();
const controller = new ReviewController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required: [_id, userId, movieId, text, likes, likeCount, createdOn, userName, userImg]
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         movieId:
 *           type: string
 *         text:
 *           type: string
 *         rating:
 *           type: number
 *         isSpoiler:
 *           type: boolean
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *         likeCount:
 *           type: integer
 *         isFlagged:
 *           type: boolean
 *         isLikedByUser:
 *           type: boolean
 *         createdOn:
 *           type: string
 *         userName:
 *           type: string
 *         userImg:
 *           type: string
 *     ReviewsPage:
 *       type: object
 *       required: [reviews, total, hasMore]
 *       properties:
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Review'
 *         total:
 *           type: integer
 *         hasMore:
 *           type: boolean
 *     AdminReview:
 *       allOf:
 *         - $ref: '#/components/schemas/Review'
 *         - type: object
 *           required: [userEmail, flaggedBy, movieTitle, movieImg]
 *           properties:
 *             userEmail:
 *               type: string
 *             flaggedBy:
 *               type: array
 *               items:
 *                 type: string
 *             movieTitle:
 *               type: string
 *             movieImg:
 *               type: string
 *     AdminReviewsPage:
 *       type: object
 *       required: [reviews, total, hasMore]
 *       properties:
 *         reviews:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminReview'
 *         total:
 *           type: integer
 *         hasMore:
 *           type: boolean
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Get reviews for a movie
 *     operationId: getReviewsByMovie
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, popular]
 *     responses:
 *       '200':
 *         description: Paginated reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewsPage'
 *   post:
 *     summary: Create a review
 *     operationId: createReview
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [movieId, text]
 *             properties:
 *               movieId:
 *                 type: string
 *               text:
 *                 type: string
 *               rating:
 *                 type: number
 *               isSpoiler:
 *                 type: boolean
 *     responses:
 *       '201':
 *         description: Created
 */
reviewRouter.get('/', controller.getReviewsByMovie);
reviewRouter.post('/', auth, controller.createReview);

/**
 * @swagger
 * /api/reviews/admin:
 *   get:
 *     summary: Get all reviews (admin)
 *     operationId: getAdminReviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: flaggedOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: userEmail
 *         schema:
 *           type: string
 *       - in: query
 *         name: movieTitle
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Paginated admin reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminReviewsPage'
 */
reviewRouter.get('/admin', auth, admin, controller.getAllReviewsAdmin);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   patch:
 *     summary: Update a review
 *     operationId: updateReview
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               rating:
 *                 type: number
 *               isSpoiler:
 *                 type: boolean
 *     responses:
 *       '200':
 *         description: Updated review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *   delete:
 *     summary: Delete a review
 *     operationId: deleteReview
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Deleted
 */
reviewRouter.patch('/:reviewId', auth, controller.updateReview);
reviewRouter.delete('/:reviewId', auth, controller.deleteReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/like:
 *   put:
 *     summary: Toggle like on a review
 *     operationId: toggleReviewLike
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 */
reviewRouter.put('/:reviewId/like', auth, controller.toggleLike);

/**
 * @swagger
 * /api/reviews/{reviewId}/report:
 *   post:
 *     summary: Flag a review
 *     operationId: flagReview
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Flagged
 */
reviewRouter.post('/:reviewId/report', auth, controller.flagReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/unflag:
 *   put:
 *     summary: Unflag a review (admin)
 *     operationId: unflagReview
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Unflagged
 */
reviewRouter.put('/:reviewId/unflag', auth, admin, controller.unflagReview);
