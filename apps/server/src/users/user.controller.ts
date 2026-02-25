import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { Review } from '@/reviews';
import { Movie } from '@/movies';
import { User } from './user.model';
import { UserService } from './user.service';
import type { ChangePasswordDto, CreateUserDto, RateMovieDto, UpdateUserDto } from './schemas';

export class UserController {
  private readonly userService = new UserService();

  getCurrentUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = await this.userService.getUserById(req.user!.sub);
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (
    req: Request<unknown, unknown, CreateUserDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tokenData = await this.userService.registerUser(req.body);
      res.status(201).send(tokenData);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (
    req: AuthenticatedRequest<UpdateUserDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.updateUser(req.user!.sub, req.body);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: AuthenticatedRequest<ChangePasswordDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.changePassword(req.user!.sub, req.body);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.userService.deleteUser(req.user!.sub);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  addFavorite = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.addFavorite(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  removeFavorite = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.removeFavorite(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  markAsSeen = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.markAsSeen(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  removeFromSeen = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.removeFromSeen(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  addToWatchlist = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.addToWatchlist(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  removeFromWatchlist = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.removeFromWatchlist(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  rateMovie = async (
    req: AuthenticatedRequest<RateMovieDto>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.rateMovie(req.user!.sub, req.body);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  deleteRating = async (
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await this.userService.deleteRating(req.user!.sub, req.body.id);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  getUserReviews = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.sub;

      const [reviews, user] = await Promise.all([
        Review.find({ userId }).sort({ createdOn: -1 }),
        User.findById(userId).select('name image'),
      ]);

      const ids = [...new Set(reviews.map((r) => r.movieId))];
      const movies = await Movie.find({ _id: { $in: ids } }).select('title image');
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
          userImage: user?.image ?? 1,
          movieTitle: movie?.title ?? '',
          movieImage: movie?.image ?? '',
        };
      });

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };
}
