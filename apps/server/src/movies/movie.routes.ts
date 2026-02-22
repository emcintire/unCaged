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
 *       required: [_id, date, director, genres, img, rating, runtime, title]
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         avgRating:
 *           type: number
 *         date:
 *           type: string
 *         description:
 *           type: string
 *         director:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         img:
 *           type: string
 *         rating:
 *           type: string
 *         runtime:
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
movieRouter.get('/', controller.getAllMovies);

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
movieRouter.get('/popular', controller.getPopularMovies);

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
movieRouter.get('/staffpicks', controller.getStaffPicks);

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
movieRouter.get('/avgRating/:id', controller.getAverageRating);

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
movieRouter.post('/', auth, admin, controller.createMovie);
