import type { NextFunction, Request,Response } from 'express';

import type { AuthenticatedRequest } from '@/types';
import { getIdFromToken, getTokenFromRequest, HttpError } from '@/utils';

import { ReviewService, type SortOption } from './review.service';
import type { CreateReviewDto, UpdateReviewDto } from './schemas';

export class ReviewController {
  private readonly reviewService = new ReviewService();

  getReviewsByMovie = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const movieId = req.query.movieId as string;
      if (!movieId) {
        throw new HttpError(400, 'movieId query parameter is required', 'MOVIE_ID_REQUIRED');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = (req.query.sort as SortOption) || 'recent';

      // Optionally extract userId from token without hard-requiring auth
      let currentUserId: string | undefined;
      const token = getTokenFromRequest(req);
      if (token) {
        try {
          currentUserId = getIdFromToken(token);
        } catch {
          // no-op — token invalid, treat as unauthenticated
        }
      }

      const result = await this.reviewService.getReviewsByMovie(movieId, {
        page,
        limit,
        sort,
        currentUserId,
      });
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  createReview = async (
    req: AuthenticatedRequest<CreateReviewDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const review = await this.reviewService.createReview(req.user!.sub, req.body);
      res.status(201).send(review);
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (
    req: AuthenticatedRequest<UpdateReviewDto, { reviewId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const updated = await this.reviewService.updateReview(
        req.params.reviewId,
        req.user!.sub,
        req.body,
      );
      res.status(200).send(updated);
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (
    req: AuthenticatedRequest<unknown, { reviewId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.reviewService.deleteReview(req.params.reviewId, req.user!.sub, req.user!.isAdmin);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  toggleLike = async (
    req: AuthenticatedRequest<unknown, { reviewId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.reviewService.toggleLike(req.params.reviewId, req.user!.sub);
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  flagReview = async (
    req: AuthenticatedRequest<unknown, { reviewId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.reviewService.flagReview(req.params.reviewId, req.user!.sub);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  unflagReview = async (
    req: AuthenticatedRequest<unknown, { reviewId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.reviewService.unflagReview(req.params.reviewId);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  getAllReviewsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const flaggedOnly = req.query.flaggedOnly === 'true';
      const userEmail = req.query.userEmail as string | undefined;
      const movieTitle = req.query.movieTitle as string | undefined;

      const result = await this.reviewService.getAllReviewsAdmin({
        page,
        limit,
        flaggedOnly,
        userEmail,
        movieTitle,
      });
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  };

  deleteReviewAdmin = async (
    req: AuthenticatedRequest<unknown, { reviewId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.reviewService.deleteReview(req.params.reviewId, req.user!.sub, req.user!.isAdmin);
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };
}
