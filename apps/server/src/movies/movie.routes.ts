import express from 'express';
import { auth, admin } from '@/middleware';
import { MovieController } from './movie.controller';

export const movieRouter = express.Router();
const controller = new MovieController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required: [_id, title, director, genres, img, rating, runtime, date, favoriteCount, ratingCount, ratingSum, seenCount]
 *       properties:
 *         _id:
 *           type: string
 *         avgRating:
 *           type: number
 *         date:
 *           type: string
 *         description:
 *           type: string
 *         director:
 *           type: string
 *         favoriteCount:
 *           type: integer
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         img:
 *           type: string
 *         rating:
 *           type: string
 *         ratingCount:
 *           type: integer
 *         ratingSum:
 *           type: integer
 *         runtime:
 *           type: string
 *         seenCount:
 *           type: integer
 *         title:
 *           type: string
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Get all movies
 *     operationId: getAllMovies
 *     tags: [Movies]
 *     responses:
 *       '200':
 *         description: List of all movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
movieRouter.get('/', controller.getAllMovies.bind(controller));

/**
 * @swagger
 * /api/movies/getMovies:
 *   post:
 *     summary: Get movies with sort options
 *     operationId: getMovies
 *     tags: [Movies]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: List of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
movieRouter.post('/getMovies', controller.getMoviesWithSort.bind(controller));

/**
 * @swagger
 * /api/movies/findByID/{id}:
 *   get:
 *     summary: Find movie by ID
 *     operationId: findMovieById
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 */
movieRouter.get('/findByID/:id', controller.findMovieById.bind(controller));

/**
 * @swagger
 * /api/movies/findByTitle/{title}:
 *   get:
 *     summary: Find movies by title path param
 *     operationId: findMoviesByTitleParam
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Movies matching title
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
movieRouter.get('/findByTitle/:title', controller.findMoviesByTitleParam.bind(controller));

/**
 * @swagger
 * /api/movies/findByTitle:
 *   post:
 *     summary: Search movies by title
 *     operationId: searchMovies
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [search]
 *             properties:
 *               search:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Movies matching search
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
movieRouter.post('/findByTitle', controller.findMoviesByTitle.bind(controller));

/**
 * @swagger
 * /api/movies/popular:
 *   get:
 *     summary: Get popular movies
 *     operationId: getPopularMovies
 *     tags: [Movies]
 *     responses:
 *       '200':
 *         description: Popular movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
movieRouter.get('/popular', controller.getPopularMovies.bind(controller));

/**
 * @swagger
 * /api/movies/staffpicks:
 *   get:
 *     summary: Get staff pick movies
 *     operationId: getStaffPicks
 *     tags: [Movies]
 *     responses:
 *       '200':
 *         description: Staff picks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
movieRouter.get('/staffpicks', controller.getStaffPicks.bind(controller));

/**
 * @swagger
 * /api/movies/avgRating/{id}:
 *   get:
 *     summary: Get average rating for a movie
 *     operationId: getAverageRating
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Average rating
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
movieRouter.get('/avgRating/:id', controller.getAverageRating.bind(controller));

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Create a movie (admin only)
 *     operationId: createMovie
 *     tags: [Movies]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, director, runtime, rating, date]
 *             properties:
 *               title:
 *                 type: string
 *               director:
 *                 type: string
 *               description:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               runtime:
 *                 type: string
 *               rating:
 *                 type: string
 *               date:
 *                 type: string
 *               img:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 */
movieRouter.post('/', auth, admin, controller.createMovie.bind(controller));

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: Update a movie (admin only)
 *     operationId: updateMovie
 *     tags: [Movies]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *               director:
 *                 type: string
 *               description:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               runtime:
 *                 type: string
 *               rating:
 *                 type: string
 *               date:
 *                 type: string
 *               img:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Updated movie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 */
movieRouter.put('/:id', auth, admin, controller.updateMovie.bind(controller));

movieRouter.get('/updateRatings', auth, controller.updateAllRatings.bind(controller));
