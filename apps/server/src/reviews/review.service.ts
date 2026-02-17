import { Review } from './review.model';
import { reviewSchema } from './review.schema';
import { User } from '@/users';
import type { CreateReviewDto } from './types';

export class ReviewService {
  async getReviewsByMovie(movieId: string) {
    const reviews = await Review.find({ movieId }).sort({ createdOn: -1 });

    const userIds = [...new Set(reviews.map((r) => r.userId))];
    const users = await User.find({ _id: { $in: userIds } }).select('name img');

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    return reviews.map((review) => {
      const user = userMap.get(review.userId);
      return {
        _id: review._id,
        userId: review.userId,
        movieId: review.movieId,
        text: review.text,
        rating: review.rating,
        isSpoiler: review.isSpoiler,
        createdOn: review.createdOn,
        userName: user?.name || '',
        userImg: user?.img || '',
      };
    });
  }

  async createReview(userId: string, movieId: string, dto: CreateReviewDto) {
    const validation = reviewSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const review = new Review({
      userId,
      movieId,
      text: dto.text,
      rating: dto.rating,
      isSpoiler: dto.isSpoiler ?? false,
    });

    await review.save();
    return review;
  }

  async deleteReview(reviewId: string, userId: string, isAdmin: boolean) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('The review with the given ID was not found.');
    }

    if (review.userId !== userId && !isAdmin) {
      throw new Error('Not authorized to delete this review.');
    }

    await Review.findByIdAndDelete(reviewId);
  }
}
