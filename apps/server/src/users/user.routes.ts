import express from 'express';
import { auth } from '@/middleware';
import { createAuthLimiter } from '@/utils';
import { UserController } from './user.controller';

const registerLimiter = createAuthLimiter({ max: 10 });

export const userRouter = express.Router();
const controller = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRating:
 *       type: object
 *       required: [_id, movie, rating]
 *       properties:
 *         _id:
 *           type: string
 *         movie:
 *           type: string
 *         rating:
 *           type: number
 *     User:
 *       type: object
 *       required: [_id, email, favorites, image, img, isAdmin, ratings, seen, watchlist]
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         favorites:
 *           type: array
 *           items:
 *             type: string
 *         image:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *           description: Profile picture index (1-6), references a local asset in the client
 *         img:
 *           type: string
 *           description: Legacy Imgur profile picture URL (kept for old iOS client compatibility)
 *         isAdmin:
 *           type: boolean
 *         name:
 *           type: string
 *         ratings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserRating'
 *         seen:
 *           type: array
 *           items:
 *             type: string
 *         watchlist:
 *           type: array
 *           items:
 *             type: string
 *     UserReview:
 *       allOf:
 *         - $ref: '#/components/schemas/Review'
 *         - type: object
 *           required: [movieTitle, movieImage]
 *           properties:
 *             movieTitle:
 *               type: string
 *             movieImage:
 *               type: string
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get current authenticated user
 *     operationId: getCurrentUser
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new user
 *     operationId: createUser
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Auth token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenData'
 *   put:
 *     summary: Update current user
 *     operationId: updateUser
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               image:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 description: Profile picture index (1-6)
 *               img:
 *                 type: string
 *                 description: Legacy Imgur URL (old iOS client only)
 *     responses:
 *       '200':
 *         description: Updated
 *   delete:
 *     summary: Delete current user
 *     operationId: deleteUser
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Deleted
 */
userRouter.get('/', auth, controller.getCurrentUser);
userRouter.post('/', registerLimiter, controller.createUser);
userRouter.put('/', auth, controller.updateUser);
userRouter.delete('/', auth, controller.deleteUser);

/**
 * @swagger
 * /api/users/changePassword:
 *   put:
 *     summary: Change password
 *     operationId: changePassword
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, password]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password changed
 */
userRouter.put('/changePassword', auth, controller.changePassword);

/**
 * @swagger
 * /api/users/favorites:
 *   put:
 *     summary: Add movie to favorites
 *     operationId: addToFavorites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Added
 *   delete:
 *     summary: Remove from favorites
 *     operationId: removeFromFavorites
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Removed
 */
userRouter.put('/favorites', auth, controller.addFavorite);
userRouter.delete('/favorites', auth, controller.removeFavorite);

/**
 * @swagger
 * /api/users/seen:
 *   put:
 *     summary: Mark movie as seen
 *     operationId: addToSeen
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Added to seen
 *   delete:
 *     summary: Remove from seen
 *     operationId: removeFromSeen
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Removed from seen
 */
userRouter.put('/seen', auth, controller.markAsSeen);
userRouter.delete('/seen', auth, controller.removeFromSeen);

/**
 * @swagger
 * /api/users/watchlist:
 *   put:
 *     summary: Add movie to watchlist
 *     operationId: addToWatchlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Added
 *   delete:
 *     summary: Remove from watchlist
 *     operationId: removeFromWatchlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Removed
 */
userRouter.put('/watchlist', auth, controller.addToWatchlist);
userRouter.delete('/watchlist', auth, controller.removeFromWatchlist);

/**
 * @swagger
 * /api/users/rate:
 *   put:
 *     summary: Rate a movie
 *     operationId: rateMovie
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id, rating]
 *             properties:
 *               id:
 *                 type: string
 *               rating:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Rating updated
 *   delete:
 *     summary: Delete a rating
 *     operationId: deleteRating
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Rating deleted
 */
userRouter.put('/rate', auth, controller.rateMovie);
userRouter.delete('/rate', auth, controller.deleteRating);

/**
 * @swagger
 * /api/users/reviews:
 *   get:
 *     summary: Get current user's reviews
 *     operationId: getMyReviews
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User reviews with movie info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserReview'
 */
userRouter.get('/reviews', auth, controller.getUserReviews);
