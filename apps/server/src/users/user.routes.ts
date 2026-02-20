import express from 'express';
import rateLimit from 'express-rate-limit';
import { auth } from '@/middleware';
import { UserController } from './user.controller';

const fiveMinutesInMs = 5 * 60 * 1000;
const authLimiter = rateLimit({
  windowMs: fiveMinutesInMs,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

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
 *       required: [__v, _id, createdOn, email, favorites, img, isAdmin, ratings, resetCode, seen, watchlist]
 *       properties:
 *         __v:
 *           type: integer
 *         _id:
 *           type: string
 *         createdOn:
 *           type: string
 *         email:
 *           type: string
 *         favorites:
 *           type: array
 *           items:
 *             type: string
 *         img:
 *           type: string
 *         isAdmin:
 *           type: boolean
 *         name:
 *           type: string
 *         password:
 *           type: string
 *         ratings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserRating'
 *         resetCode:
 *           type: string
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
 *           required: [movieTitle, movieImg]
 *           properties:
 *             movieTitle:
 *               type: string
 *             movieImg:
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
 *       - xAuthToken: []
 *     responses:
 *       '200':
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   post:
 *     summary: Register a new user
 *     operationId: register
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
 *               type: string
 *   put:
 *     summary: Update current user
 *     operationId: updateUser
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
 *               img:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Updated
 *   delete:
 *     summary: Delete current user
 *     operationId: deleteUser
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
userRouter.get('/', auth, controller.getCurrentUser.bind(controller));
userRouter.post('/', authLimiter, controller.registerUser.bind(controller));
userRouter.put('/', auth, controller.updateUser.bind(controller));
userRouter.delete('/', auth, controller.deleteUser.bind(controller));

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login
 *     operationId: login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Auth token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
userRouter.post('/login', authLimiter, controller.login.bind(controller));

/**
 * @swagger
 * /api/users/changePassword:
 *   put:
 *     summary: Change password
 *     operationId: changePassword
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password changed
 */
userRouter.put('/changePassword', auth, controller.changePassword.bind(controller));

/**
 * @swagger
 * /api/users/forgotPassword:
 *   post:
 *     summary: Request password reset
 *     operationId: forgotPassword
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Reset token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
userRouter.post('/forgotPassword', authLimiter, controller.forgotPassword.bind(controller));

/**
 * @swagger
 * /api/users/checkCode:
 *   post:
 *     summary: Check password reset code
 *     operationId: checkCode
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Result message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
userRouter.post('/checkCode', authLimiter, controller.checkResetCode.bind(controller));

/**
 * @swagger
 * /api/users/favorites:
 *   get:
 *     summary: Get favorite movies
 *     operationId: getFavorites
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       '200':
 *         description: Favorite movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *   put:
 *     summary: Add movie to favorites
 *     operationId: addToFavorites
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
 *       - xAuthToken: []
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
userRouter.get('/favorites', auth, controller.getFavorites.bind(controller));
userRouter.put('/favorites', auth, controller.addFavorite.bind(controller));
userRouter.delete('/favorites', auth, controller.removeFavorite.bind(controller));

userRouter.get('/unseen', auth, controller.getUnseenMovies.bind(controller));

/**
 * @swagger
 * /api/users/seen:
 *   get:
 *     summary: Get seen movies
 *     operationId: getSeen
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       '200':
 *         description: Seen movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *   put:
 *     summary: Mark movie as seen
 *     operationId: addToSeen
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
 *       - xAuthToken: []
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
userRouter.get('/seen', auth, controller.getSeenMovies.bind(controller));
userRouter.put('/seen', auth, controller.markAsSeen.bind(controller));
userRouter.delete('/seen', auth, controller.removeFromSeen.bind(controller));

/**
 * @swagger
 * /api/users/watchlist:
 *   get:
 *     summary: Get watchlist
 *     operationId: getWatchlist
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       '200':
 *         description: Watchlist movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *   put:
 *     summary: Add movie to watchlist
 *     operationId: addToWatchlist
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
 *       - xAuthToken: []
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
userRouter.get('/watchlist', auth, controller.getWatchlist.bind(controller));
userRouter.put('/watchlist', auth, controller.addToWatchlist.bind(controller));
userRouter.delete('/watchlist', auth, controller.removeFromWatchlist.bind(controller));

/**
 * @swagger
 * /api/users/rate:
 *   get:
 *     summary: Get rated movies
 *     operationId: getRatings
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       '200':
 *         description: Rated movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *   put:
 *     summary: Rate a movie
 *     operationId: rateMovie
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
 *         description: Updated token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *   delete:
 *     summary: Delete a rating
 *     operationId: deleteRating
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
userRouter.get('/rate', auth, controller.getRatings.bind(controller));
userRouter.put('/rate', auth, controller.rateMovie.bind(controller));
userRouter.delete('/rate', auth, controller.deleteRating.bind(controller));

/**
 * @swagger
 * /api/users/filteredMovies:
 *   post:
 *     summary: Get filtered movies for current user
 *     operationId: getFilteredMovies
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [seen, rotten, time, genres, min, max]
 *             properties:
 *               seen:
 *                 type: boolean
 *               rotten:
 *                 type: boolean
 *               time:
 *                 type: number
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               min:
 *                 type: number
 *               max:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Filtered movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
userRouter.post('/filteredMovies', auth, controller.getFilteredMovies.bind(controller));

/**
 * @swagger
 * /api/users/reviews:
 *   get:
 *     summary: Get current user's reviews
 *     operationId: getMyReviews
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
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
userRouter.get('/reviews', auth, controller.getUserReviews.bind(controller));
