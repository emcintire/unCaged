import express from 'express';
import { auth, admin } from '@/middleware';
import { MovieController } from './movie.controller';

export const movieRouter = express.Router();
const controller = new MovieController();

movieRouter.get('/', controller.getAllMovies.bind(controller));
movieRouter.post('/getMovies', controller.getMoviesWithSort.bind(controller));
movieRouter.get('/findByID/:id', controller.findMovieById.bind(controller));
movieRouter.get('/findByTitle/:title', controller.findMoviesByTitleParam.bind(controller));
movieRouter.post('/findByTitle', controller.findMoviesByTitle.bind(controller));
movieRouter.get('/popular', controller.getPopularMovies.bind(controller));
movieRouter.get('/staffpicks', controller.getStaffPicks.bind(controller));
movieRouter.get('/avgRating/:id', controller.getAverageRating.bind(controller));

movieRouter.post('/', auth, admin, controller.createMovie.bind(controller));
movieRouter.put('/:id', auth, admin, controller.updateMovie.bind(controller));
movieRouter.get('/updateRatings', auth, controller.updateAllRatings.bind(controller));
