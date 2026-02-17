import type { Response, Request } from 'express';
import { MovieService } from './movie.service';
import type {
  GetMoviesDto,
  FindByTitleDto,
  CreateMovieDto,
  UpdateMovieDto,
} from './types';

const movieService = new MovieService();

export class MovieController {
  async getAllMovies(_req: Request<unknown, unknown, GetMoviesDto>, res: Response) {
    try {
      const movies = await movieService.getAllMovies();
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getMoviesWithSort(req: Request<unknown, unknown, GetMoviesDto>, res: Response) {
    try {
      const movies = await movieService.getAllMovies(req.body);
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async findMovieById(req: Request<{ id: string }>, res: Response) {
    try {
      const movie = await movieService.findMovieById(req.params.id);
      res.status(200).send(movie);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async findMoviesByTitleParam(req: Request<{ title: string }>, res: Response) {
    try {
      const movies = await movieService.findMoviesByTitleParam(req.params.title);
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async findMoviesByTitle(req: Request<unknown, unknown, FindByTitleDto>, res: Response) {
    try {
      const movies = await movieService.findMoviesByTitle(req.body);
      res.status(200).send(movies);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async createMovie(req: Request<unknown, unknown, CreateMovieDto>, res: Response) {
    try {
      await movieService.createMovie(req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async updateMovie(req: Request<{ id: string }, unknown, UpdateMovieDto>, res: Response) {
    try {
      await movieService.updateMovie(req.params.id, req.body);
      res.sendStatus(200);
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

  // legacy endpoint for outdated iOS build
  async updateAllRatings(_req: Request, res: Response) {
    try {
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
