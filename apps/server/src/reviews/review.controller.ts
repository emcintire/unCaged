import type { Response, Request } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { ReviewService } from './review.service';
import type { CreateReviewDto } from './types';

const reviewService = new ReviewService();

export class ReviewController {
  async getReviewsByMovie(req: Request<{ movieId: string }>, res: Response) {
    try {
      const reviews = await reviewService.getReviewsByMovie(req.params.movieId);
      res.status(200).send(reviews);
    } catch (error) {
      res.status(500).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async createReview(req: AuthenticatedRequest<CreateReviewDto, { movieId: string }>, res: Response) {
    try {
      if (!req.user) {
        res.status(401).send('Not authenticated');
        return;
      }
      const review = await reviewService.createReview(req.user._id, req.params.movieId, req.body);
      res.status(200).send(review);
    } catch (error) {
      res.status(400).send(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async deleteReview(req: AuthenticatedRequest<unknown, { movieId: string; reviewId: string }>, res: Response) {
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
}
