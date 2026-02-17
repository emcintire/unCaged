import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { getUserIdFromRequest } from '@/util';
import type {
  RegisterUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  LoginDto,
  MovieActionDto,
  RateMovieDto,
  ForgotPasswordDto,
  CheckCodeDto,
  FilteredMoviesDto,
} from './types';
import { UserService } from './user.service';

const userService = new UserService();

export class UserController {
  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const user = await userService.getUserById(userId);
      res.status(200).send(user);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async registerUser(req: Request<unknown, unknown, RegisterUserDto>, res: Response) {
    try {
      const token = await userService.registerUser(req.body);
      res.send(token);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async updateUser(req: AuthenticatedRequest<UpdateUserDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.updateUser(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async changePassword(req: AuthenticatedRequest<ChangePasswordDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.changePassword(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async login(req: Request<unknown, unknown, LoginDto>, res: Response) {
    try {
      const token = await userService.login(req.body);
      res.send(token);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.deleteUser(userId);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getFavorites(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const movies = await userService.getFavorites(userId);
      res.status(200).send(movies);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async addFavorite(req: AuthenticatedRequest<MovieActionDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.addFavorite(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async removeFavorite(req: AuthenticatedRequest<MovieActionDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.removeFavorite(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getUnseenMovies(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const movies = await userService.getUnseenMovies(userId);
      res.status(200).send(movies);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getSeenMovies(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const movies = await userService.getSeenMovies(userId);
      res.status(200).send(movies);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async markAsSeen(req: AuthenticatedRequest<MovieActionDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.markAsSeen(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async removeFromSeen(req: AuthenticatedRequest<MovieActionDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.removeFromSeen(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getWatchlist(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const movies = await userService.getWatchlist(userId);
      res.status(200).send(movies);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async addToWatchlist(req: AuthenticatedRequest<MovieActionDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.addToWatchlist(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async removeFromWatchlist(req: AuthenticatedRequest<MovieActionDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.removeFromWatchlist(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getRatings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const movies = await userService.getRatings(userId);
      res.status(200).send(movies);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async rateMovie(req: AuthenticatedRequest<RateMovieDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.rateMovie(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async deleteRating(req: AuthenticatedRequest<MovieActionDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      await userService.deleteRating(userId, req.body);
      res.status(200).send();
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async forgotPassword(req: Request<unknown, unknown, ForgotPasswordDto>, res: Response) {
    try {
      await userService.forgotPassword(req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async checkResetCode(req: Request<unknown, unknown, CheckCodeDto>, res: Response) {
    try {
      await userService.checkResetCode(req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getFilteredMovies(req: AuthenticatedRequest<FilteredMoviesDto>, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const movies = await userService.getFilteredMovies(userId, req.body);
      res.status(200).send(movies);
    } catch (error) {
      res.status(404).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
