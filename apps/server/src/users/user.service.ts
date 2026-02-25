import bcrypt from 'bcrypt';
import type { ClientSession } from 'mongoose';

import { RefreshToken } from '@/auth';
import { Movie } from '@/movies';
import {
  createRefreshTokenValue,
  hashInput,
  hashRefreshToken,
  HttpError,
  refreshExpiryDate,
  signAccessToken,
  validateSchema,
} from '@/utils';

import {
  type ChangePasswordDto,
  changePasswordDtoSchema,
  type CreateUserDto,
  createUserDtoSchema,
  type RateMovieDto,
  rateMovieDtoSchema,
  type UpdateUserDto,
  updateUserDtoSchema,
} from './schemas';
import { User } from './user.model';

type UserCollectionField = 'favorites' | 'seen' | 'watchlist';
type MovieCounterField = 'favoriteCount' | 'seenCount';

export class UserService {
  private async ensureUserExists(userId: string) {
    const exists = await User.findById(userId);
    if (!exists) {
      throw new HttpError(404, 'The user with the given ID was not found.', 'USER_NOT_FOUND');
    }
  }

  private async recalculateMovieAverage(movieId: string, session?: ClientSession) {
    const movieQuery = Movie.findById(movieId);
    if (session) {
      movieQuery.session(session);
    }

    const movie = await movieQuery;
    if (!movie) {
      throw new HttpError(404, 'The movie with the given ID was not found.', 'MOVIE_NOT_FOUND');
    }

    movie.avgRating = movie.ratingCount > 0
      ? Math.round(movie.ratingSum / movie.ratingCount * 10) / 10
      : 0;
    if (session) {
      await movie.save({ session });
      return;
    }

    await movie.save();
  }

  private async addToUserCollection(
    userId: string,
    field: UserCollectionField,
    movieId: string,
    counterField?: MovieCounterField
  ) {
    const query: Record<string, unknown> = { _id: userId, [field]: { $ne: movieId } };
    const update: Record<string, unknown> = { $addToSet: { [field]: movieId } };
    const result = await User.updateOne(query, update);
    
    if (result.matchedCount === 0) {
      await this.ensureUserExists(userId);
      return;
    }

    if (result.modifiedCount > 0 && counterField) {
      await Movie.findByIdAndUpdate(movieId, { $inc: { [counterField]: 1 } });
    }
  }

  private async removeFromUserCollection(
    userId: string,
    field: UserCollectionField,
    movieId: string,
    counterField?: MovieCounterField
  ) {
    const query: Record<string, unknown> = { _id: userId, [field]: movieId };
    const update: Record<string, unknown> = { $pull: { [field]: movieId } };
    const result = await User.updateOne(query, update);
    
    if (result.matchedCount === 0) {
      await this.ensureUserExists(userId);
      return;
    }

    if (result.modifiedCount > 0 && counterField) {
      await Movie.findByIdAndUpdate(movieId, { $inc: { [counterField]: -1 } });
    }
  }

  async getUserById(userId: string) {
    const user = await User
      .findById(userId)
      .select('_id email favorites image img isAdmin name ratings seen watchlist')
      .lean();
    if (!user) {
      throw new HttpError(404, 'The user with the given ID was not found.', 'USER_NOT_FOUND');
    }
    return user;
  }

  async registerUser(dto: CreateUserDto) {
    validateSchema(createUserDtoSchema, dto);

    const email = dto.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new HttpError(
        409,
        'There is already an account associated with this email.',
        'EMAIL_ALREADY_REGISTERED'
      );
    }

    const hashedPassword = await hashInput(dto.password);

    const user = new User({
      ...(dto.name ? { name: dto.name.trim() } : {}),
      email,
      password: hashedPassword,
    });

    await user.save();

    const accessToken = signAccessToken({ sub: String(user._id), isAdmin: user.isAdmin });
    const refreshToken = createRefreshTokenValue();
    const refreshHash = hashRefreshToken(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: refreshHash,
      expiresAt: refreshExpiryDate(),
      lastUsedAt: new Date(),
    });

    return { accessToken, refreshToken };
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    validateSchema(updateUserDtoSchema, dto);

    const user = await User.findByIdAndUpdate(userId, { $set: dto });
    if (!user) {
      throw new HttpError(404, 'The user with the given ID was not found.', 'USER_NOT_FOUND');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    validateSchema(changePasswordDtoSchema, dto);

    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError(404, 'The user with the given ID was not found.', 'USER_NOT_FOUND');
    }

    const validPassword = await bcrypt.compare(dto.currentPassword, user.password);
    if (!validPassword) {
      throw new HttpError(401, 'Invalid password', 'INVALID_PASSWORD');
    }

    const newPassword = await hashInput(dto.password);
    user.password = newPassword;
    await user.save();
    await RefreshToken.deleteMany({ userId: user._id });
  }

  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new HttpError(404, 'The user with the given ID was not found.', 'USER_NOT_FOUND');
    }

    const cleanupOps: Promise<unknown>[] = [
      RefreshToken.deleteMany({ userId: user._id }),
    ];

    if (user.favorites.length > 0) {
      cleanupOps.push(
        Movie.updateMany({ _id: { $in: user.favorites } }, { $inc: { favoriteCount: -1 } })
      );
    }

    if (user.seen.length > 0) {
      cleanupOps.push(
        Movie.updateMany({ _id: { $in: user.seen } }, { $inc: { seenCount: -1 } })
      );
    }

    if (user.ratings.length > 0) {
      const ratingBulkOps = user.ratings.map((r) => ({
        updateOne: {
          filter: { _id: r.movie },
          update: { $inc: { ratingCount: -1, ratingSum: -r.rating } },
        },
      }));
      cleanupOps.push(Movie.bulkWrite(ratingBulkOps));
    }

    await Promise.all(cleanupOps);

    if (user.ratings.length > 0) {
      const uniqueMovieIds = [...new Set(user.ratings.map((r) => String(r.movie)))];
      await Promise.all(uniqueMovieIds.map((id) => this.recalculateMovieAverage(id)));
    }
  }

  async addFavorite(userId: string, movieId: string) {
    await this.addToUserCollection(userId, 'favorites', movieId, 'favoriteCount');
  }

  async removeFavorite(userId: string, movieId: string) {
    await this.removeFromUserCollection(userId, 'favorites', movieId, 'favoriteCount');
  }

  async markAsSeen(userId: string, movieId: string) {
    await this.addToUserCollection(userId, 'seen', movieId, 'seenCount');
  }

  async removeFromSeen(userId: string, movieId: string) {
    await this.removeFromUserCollection(userId, 'seen', movieId, 'seenCount');
  }

  async addToWatchlist(userId: string, movieId: string) {
    await this.addToUserCollection(userId, 'watchlist', movieId);
  }

  async removeFromWatchlist(userId: string, movieId: string) {
    await this.removeFromUserCollection(userId, 'watchlist', movieId);
  }

  async rateMovie(userId: string, dto: RateMovieDto) {
    validateSchema(rateMovieDtoSchema, dto);

    const session = await User.startSession();

    try {
      await session.withTransaction(async () => {
        const user = await User.findById(userId).session(session);
        if (!user) {
          throw new HttpError(404, 'The user with the given ID was not found.', 'USER_NOT_FOUND');
        }

        const existingRating = user.ratings.find((r) => String(r.movie) === String(dto.id));

        if (existingRating) {
          const diff = dto.rating - existingRating.rating;
          await Movie.findByIdAndUpdate(
            dto.id,
            { $inc: { ratingSum: diff } },
            { session }
          );
          await User.findByIdAndUpdate(
            userId,
            { $pull: { ratings: { movie: dto.id } } },
            { session }
          );
        } else {
          await Movie.findByIdAndUpdate(
            dto.id,
            { $inc: { ratingCount: 1, ratingSum: dto.rating } },
            { session }
          );
        }

        await User.findByIdAndUpdate(
          userId,
          { $push: { ratings: { movie: dto.id, rating: dto.rating } } },
          { session }
        );

        await this.recalculateMovieAverage(dto.id, session);
      });
    } finally {
      await session.endSession();
    }
  }

  async deleteRating(userId: string, movieId: string) {
    const session = await User.startSession();

    try {
      await session.withTransaction(async () => {
        const user = await User.findById(userId).session(session);
        if (!user) {
          throw new HttpError(404, 'The user with the given ID was not found.', 'USER_NOT_FOUND');
        }

        const existingRating = user.ratings.find((r) => String(r.movie) === String(movieId));
        if (!existingRating) {
          throw new HttpError(404, 'The rating with the given ID was not found.', 'RATING_NOT_FOUND');
        }

        await User.findByIdAndUpdate(
          userId,
          { $pull: { ratings: { movie: movieId } } },
          { session }
        );

        const movie = await Movie.findByIdAndUpdate(
          movieId,
          { $inc: { ratingCount: -1, ratingSum: -existingRating.rating } },
          { new: true, session }
        );

        if (!movie) {
          throw new HttpError(404, 'The movie with the given ID was not found.', 'MOVIE_NOT_FOUND');
        }

        await this.recalculateMovieAverage(movieId, session);
      });
    } finally {
      await session.endSession();
    }
  }
}
