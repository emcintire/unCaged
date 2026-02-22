import type { PipelineStage } from 'mongoose';
import { Review } from './review.model';
import { reviewSchema } from './schemas/review.schema';
import { User } from '@/users';
import { Movie } from '@/movies';
import type { CreateReviewDto } from './types';

export type SortOption = 'recent' | 'popular';

export interface GetReviewsOptions {
  page?: number;
  limit?: number;
  sort?: SortOption;
  currentUserId?: string;
}

export interface AdminReviewsOptions {
  page?: number;
  limit?: number;
  flaggedOnly?: boolean;
  userEmail?: string;
  movieTitle?: string;
}

export class ReviewService {
  async getReviewsByMovie(movieId: string, options: GetReviewsOptions = {}) {
    const { page = 1, limit = 10, sort = 'recent', currentUserId } = options;
    const skip = (page - 1) * limit;

    const sortStage: PipelineStage = sort === 'popular'
      ? { $sort: { likeCount: -1, createdOn: -1 } }
      : { $sort: { createdOn: -1 } };

    const pipeline: PipelineStage[] = [
      { $match: { movieId } },
      { $addFields: { likeCount: { $size: '$likes' } } },
      sortStage,
    ];

    const [countResult] = await Review.aggregate([...pipeline, { $count: 'total' }]);
    const total: number = countResult?.total ?? 0;

    const reviews = await Review.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]);

    const userIds = [...new Set(reviews.map((r) => r.userId))];
    const users = await User.find({ _id: { $in: userIds } }).select('name img');
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const enriched = reviews.map((review) => {
      const user = userMap.get(review.userId);
      return {
        _id: review._id.toString(),
        userId: review.userId,
        movieId: review.movieId,
        text: review.text,
        rating: review.rating,
        isSpoiler: review.isSpoiler,
        likes: review.likes ?? [],
        likeCount: review.likeCount ?? 0,
        isFlagged: review.isFlagged,
        isLikedByUser: currentUserId ? (review.likes ?? []).includes(currentUserId) : false,
        createdOn: review.createdOn,
        userName: user?.name || '',
        userImg: user?.img || '',
      };
    });

    return { reviews: enriched, total, hasMore: skip + enriched.length < total };
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    const validation = reviewSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const review = new Review({
      userId,
      movieId: dto.movieId,
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

  async toggleLike(reviewId: string, userId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('The review with the given ID was not found.');
    }

    const hasLiked = review.likes.includes(userId);
    if (hasLiked) {
      await Review.findByIdAndUpdate(reviewId, { $pull: { likes: userId } });
    } else {
      await Review.findByIdAndUpdate(reviewId, { $addToSet: { likes: userId } });
    }

    return { liked: !hasLiked };
  }

  async flagReview(reviewId: string, userId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('The review with the given ID was not found.');
    }

    if (review.userId === userId) {
      throw new Error('You cannot report your own review.');
    }

    if (review.flaggedBy.includes(userId)) {
      throw new Error('You have already reported this review.');
    }

    await Review.findByIdAndUpdate(reviewId, {
      $addToSet: { flaggedBy: userId },
      $set: { isFlagged: true },
    });
  }

  async unflagReview(reviewId: string) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('The review with the given ID was not found.');
    }

    await Review.findByIdAndUpdate(reviewId, {
      $set: { isFlagged: false, flaggedBy: [] },
    });
  }

  async getUserReviews(userId: string) {
    const reviews = await Review.find({ userId }).sort({ createdOn: -1 });

    const movieIds = [...new Set(reviews.map((r) => r.movieId))];
    const movies = await Movie.find({ _id: { $in: movieIds } }).select('title img');
    const movieMap = new Map(movies.map((m) => [m._id.toString(), m]));

    return reviews.map((review) => {
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
        movieTitle: movie?.title || '',
        movieImg: movie?.img || '',
      };
    });
  }

  async getAllReviewsAdmin(options: AdminReviewsOptions = {}) {
    const { page = 1, limit = 20, flaggedOnly, userEmail, movieTitle } = options;
    const skip = (page - 1) * limit;

    const match: Record<string, unknown> = {};
    if (flaggedOnly) match.isFlagged = true;

    if (userEmail) {
      const matchedUsers = await User.find({ email: new RegExp(userEmail, 'i') }).select('_id');
      match.userId = { $in: matchedUsers.map((u) => u._id.toString()) };
    }

    if (movieTitle) {
      const matchedMovies = await Movie.find({ title: new RegExp(movieTitle, 'i') }).select('_id');
      match.movieId = { $in: matchedMovies.map((m) => m._id.toString()) };
    }

    const total = await Review.countDocuments(match);
    const reviews = await Review.find(match).sort({ createdOn: -1 }).skip(skip).limit(limit);

    const userIds = [...new Set(reviews.map((r) => r.userId))];
    const movieIds = [...new Set(reviews.map((r) => r.movieId))];

    const [users, movies] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select('name email img'),
      Movie.find({ _id: { $in: movieIds } }).select('title img'),
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const movieMap = new Map(movies.map((m) => [m._id.toString(), m]));

    const enriched = reviews.map((review) => {
      const user = userMap.get(review.userId);
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
        flaggedBy: review.flaggedBy ?? [],
        createdOn: review.createdOn,
        userName: user?.name || '',
        userEmail: (user as any)?.email || '',
        userImg: user?.img || '',
        movieTitle: movie?.title || '',
        movieImg: movie?.img || '',
      };
    });

    return { reviews: enriched, total, hasMore: skip + enriched.length < total };
  }
}
