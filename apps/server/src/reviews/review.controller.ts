import type { Response, Request } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { ReviewService } from './review.service';
import type { CreateReviewDto } from './types';
import type { SortOption } from './review.service';
import { getIdFromToken } from '@/util';

const reviewService = new ReviewService();

export class ReviewController {
  async getReviewsByMovie(req: Request, res: Response) {
    try {
      const movieId = req.query.movieId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = (req.query.sort as SortOption) || 'recent';

      // Optionally extract userId from token without hard-requiring auth
      let currentUserId: string | undefined;
      const token = req.header('x-auth-token');
      if (token) {
        try {
          currentUserId = getIdFromToken(token);
        } catch {
          // no-op — token invalid, treat as unauthenticated
        }
      }

      const result = await reviewService.getReviewsByMovie(movieId, {
        page,
        limit,
        sort,
        currentUserId,
      });
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async createReview(req: AuthenticatedRequest<CreateReviewDto>, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Not authenticated');
        return;
      }
      const review = await reviewService.createReview(req.user._id, req.body);
      res.status(200).send(review);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async deleteReview(req: AuthenticatedRequest<unknown, { reviewId: string }>, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Not authenticated');
        return;
      }
      await reviewService.deleteReview(req.params.reviewId, req.user._id, req.user.isAdmin);
      res.sendStatus(200);
    } catch (error) {
      if (error instanceof Error && error.message === 'Not authorized to delete this review.') {
        res.status(401).send(error.message);
        return;
      }
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async toggleLike(req: AuthenticatedRequest<unknown, { reviewId: string }>, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Not authenticated');
        return;
      }
      const result = await reviewService.toggleLike(req.params.reviewId, req.user._id);
      res.status(200).send(result);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async flagReview(req: AuthenticatedRequest<unknown, { reviewId: string }>, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Not authenticated');
        return;
      }
      await reviewService.flagReview(req.params.reviewId, req.user._id);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async unflagReview(req: AuthenticatedRequest<unknown, { reviewId: string }>, res: Response) {
    try {
      await reviewService.unflagReview(req.params.reviewId);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async getAllReviewsAdmin(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const flaggedOnly = req.query.flaggedOnly === 'true';
      const userEmail = req.query.userEmail as string | undefined;
      const movieTitle = req.query.movieTitle as string | undefined;

      const result = await reviewService.getAllReviewsAdmin({ page, limit, flaggedOnly, userEmail, movieTitle });
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async deleteReviewAdmin(req: AuthenticatedRequest<unknown, { reviewId: string }>, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Not authenticated');
        return;
      }
      await reviewService.deleteReview(req.params.reviewId, req.user._id, true);
      res.sendStatus(200);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
