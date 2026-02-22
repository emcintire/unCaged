import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { getUserIdFromRequest } from '@/util';
import type {
  RegisterUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  MovieActionDto,
  RateMovieDto,
} from './types';
import { UserService } from './user.service';
import { User } from './user.model';
import { Review } from '../reviews/review.model';
import { Movie } from '@/movies';

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
      const tokenData = await userService.registerUser(req.body);
      res.send(tokenData);
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

  async getUserReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = getUserIdFromRequest(req, res);
      if (!userId) return;

      const [reviews, user] = await Promise.all([
        Review.find({ userId }).sort({ createdOn: -1 }),
        User.findById(userId).select('name img'),
      ]);

      const movieIds = [...new Set(reviews.map((r) => r.movieId))];
      const movies = await Movie.find({ _id: { $in: movieIds } }).select('title img');
      const movieMap = new Map(movies.map((m) => [m._id.toString(), m]));

      const result = reviews.map((review) => {
        const movie = movieMap.get(review.movieId);
        return {
          _id: review._id.toString(),
          userId: review.userId,
          movieId: review.movieId,
          text: review.text,
          rating: review.rating,
          isSpoiler: review.isSpoiler,
          likes: review.likes ?? [],
          likeCount: review.likes?.length ?? 0,
          isFlagged: review.isFlagged,
          createdOn: review.createdOn,
          userName: user?.name ?? '',
          userImg: user?.img ?? '',
          movieTitle: movie?.title ?? '',
          movieImg: movie?.img ?? '',
        };
      });

      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
