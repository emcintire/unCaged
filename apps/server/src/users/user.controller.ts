import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { Review } from '@/reviews';
import { Movie } from '@/movies';
import { UserService } from './user.service';
import { User } from './user.model';
import { CreateUserDto, RateMovieDto, UpdateUserDto } from './schemas';

const userService = new UserService();

export class UserController {
  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await userService.getUserById(req.user!.sub);
      res.status(200).send(user);
    } catch (error) {
      res.status(401).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async createUser(req: Request<unknown, unknown, CreateUserDto>, res: Response) {
    try {
      const tokenData = await userService.registerUser(req.body);
      res.send(tokenData);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async updateUser(req: AuthenticatedRequest<UpdateUserDto>, res: Response) {
    try {
      await userService.updateUser(req.user!.sub, req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async changePassword(req: AuthenticatedRequest<UpdateUserDto>, res: Response) {
    try {
      await userService.changePassword(req.user!.sub, req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      await userService.deleteUser(req.user!.sub);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async addFavorite(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    try {
      await userService.addFavorite(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async removeFavorite(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    try {
      await userService.removeFavorite(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async markAsSeen(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    try {
      await userService.markAsSeen(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async removeFromSeen(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    try {
      await userService.removeFromSeen(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async addToWatchlist(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    try {
      await userService.addToWatchlist(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async removeFromWatchlist(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    try {
      await userService.removeFromWatchlist(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async rateMovie(req: AuthenticatedRequest<RateMovieDto>, res: Response) {
    try {
      await userService.rateMovie(req.user!.sub, req.body);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async deleteRating(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    try {
      await userService.deleteRating(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getUserReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.sub;

      const [reviews, user] = await Promise.all([
        Review.find({ userId }).sort({ createdOn: -1 }),
        User.findById(userId).select('name img'),
      ]);

      const ids = [...new Set(reviews.map((r) => r.id))];
      const movies = await Movie.find({ _id: { $in: ids } }).select('title img');
      const movieMap = new Map(movies.map((m) => [m._id.toString(), m]));

      const result = reviews.map((review) => {
        const movie = movieMap.get(review.id);
        return {
          _id: review._id.toString(),
          userId: review.userId,
          id: review.id,
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
