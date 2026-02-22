import bcrypt from 'bcrypt';
import type { ClientSession } from 'mongoose';
import { RefreshToken } from '@/auth';
import {
  createRefreshTokenValue,
  hashInput,
  hashRefreshToken,
  refreshExpiryDate,
  signAccessToken,
  validateSchema,
} from '@/utils';
import { Movie } from '@/movies';
import { CreateUserDto, createUserDtoSchema, UpdateUserDto, updateUserDtoSchema, RateMovieDto, rateMovieDtoSchema } from './schemas';
import { User } from './user.model';

type UserCollectionField = 'favorites' | 'seen' | 'watchlist';
type MovieCounterField = 'favoriteCount' | 'seenCount';

export class UserService {
  private async ensureUserExists(userId: string) {
    const exists = await User.findById(userId);
    if (!exists) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  private async recalculateMovieAverage(movieId: string, session?: ClientSession) {
    const movieQuery = Movie.findById(movieId);
    if (session) {
      movieQuery.session(session);
    }

    const movie = await movieQuery;
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
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
      .select('_id email favorites img isAdmin name ratings seen watchlist')
      .lean();
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return user;
  }

  async registerUser(dto: CreateUserDto) {
    validateSchema(createUserDtoSchema, dto);

    const email = dto.email.trim();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('There is already an account associated with this email.');
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
      throw new Error('The user with the given ID was not found.');
    }
  }

  async changePassword(userId: string, dto: UpdateUserDto) {
    validateSchema(updateUserDtoSchema, dto);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    const validPassword = await bcrypt.compare(dto.currentPassword!, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    const newPassword = await hashInput(dto.password!);
    user.password = newPassword;
    await user.save();
  }

  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
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
          throw new Error('The user with the given ID was not found.');
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
          throw new Error('The user with the given ID was not found.');
        }

        const existingRating = user.ratings.find((r) => String(r.movie) === String(movieId));
        if (!existingRating) {
          throw new Error('The rating with the given ID was not found.');
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
          throw new Error('The movie with the given ID was not found.');
        }

        await this.recalculateMovieAverage(movieId, session);
      });
    } finally {
      await session.endSession();
    }
  }
}
