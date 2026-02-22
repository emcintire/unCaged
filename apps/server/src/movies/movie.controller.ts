import type { Response, Request } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './schemas';

const movieService = new MovieService();

export class MovieController {
  async getAllMovies(_req: Request, res: Response) {
    try {
      const movies = await movieService.getAllMovies();
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async createMovie(req: AuthenticatedRequest<CreateMovieDto>, res: Response) {
    try {
      await movieService.createMovie(req.body);
      res.sendStatus(201);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getPopularMovies(_req: Request, res: Response) {
    try {
      const movies = await movieService.getPopularMovies();
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getStaffPicks(_req: Request, res: Response) {
    try {
      const movies = await movieService.getStaffPicks();
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getAverageRating(req: Request<{ id: string }>, res: Response) {
    try {
      const avgRating = await movieService.getAverageRating(req.params.id);
      res.status(200).send(avgRating);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
