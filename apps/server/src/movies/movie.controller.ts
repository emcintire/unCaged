import type { NextFunction, Request,Response } from 'express';

import type { AuthenticatedRequest } from '@/types';
import { getUserIdFromRequest } from '@/utils';

import { MovieService } from './movie.service';
import { CreateMovieDto } from './schemas';

export class MovieController {
  private readonly movieService = new MovieService();

  getAllMovies = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const movies = await this.movieService.getAllMovies();
      res.status(200).send(movies);
    } catch (error) {
      next(error);
    }
  };

  createMovie = async (
    req: AuthenticatedRequest<CreateMovieDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.movieService.createMovie(req.body);
      res.sendStatus(201);
    } catch (error) {
      next(error);
    }
  };

  getPopularMovies = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const movies = await this.movieService.getPopularMovies();
      res.status(200).send(movies);
    } catch (error) {
      next(error);
    }
  };

  getStaffPicks = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const movies = await this.movieService.getStaffPicks();
      res.status(200).send(movies);
    } catch (error) {
      next(error);
    }
  };

  getRecommendations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;
      const movies = await this.movieService.getRecommendations(userId);
      res.status(200).send(movies);
    } catch (error) {
      next(error);
    }
  };

  getAverageRating = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const avgRating = await this.movieService.getAverageRating(req.params.id);
      res.status(200).send(avgRating);
    } catch (error) {
      next(error);
    }
  };
}
