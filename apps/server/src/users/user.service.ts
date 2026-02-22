import bcrypt from 'bcrypt';
import { newUserSchema, User } from '@/users';
import { Movie, movieRatingSchema } from '@/movies';
import { createRefreshTokenValue, hashInput, hashRefreshToken, refreshExpiryDate, signAccessToken } from '@/util';
import type {
  RegisterUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  MovieActionDto,
  RateMovieDto,
} from './types';
import { updateUserSchema } from './schemas/updateUser.schema';
import { RefreshToken } from '@/auth';

export class UserService {
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

  async registerUser(dto: RegisterUserDto) {
    const validation = newUserSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const existingUser = await User.findOne({ email: dto.email });
    if (existingUser) {
      throw new Error('User already registered');
    }

    const user = new User({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
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
    const validation = updateUserSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const user = await User.findByIdAndUpdate(userId, { $set: dto });
    if (!user) {
      throw new Error('User not found');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const validation = updateUserSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const validPassword = await bcrypt.compare(dto.currentPassword, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    const newPassword = await hashInput(dto.password);
    user.password = newPassword;
    await user.save();
  }

  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  async addFavorite(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $push: { favorites: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    await Movie.findByIdAndUpdate(dto.id, { $inc: { favoriteCount: 1 } });
  }

  async removeFavorite(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $pull: { favorites: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    await Movie.findByIdAndUpdate(dto.id, { $inc: { favoriteCount: -1 } });
  }

  async markAsSeen(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $push: { seen: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    await Movie.findByIdAndUpdate(dto.id, { $inc: { seenCount: 1 } });
  }

  async removeFromSeen(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $pull: { seen: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    await Movie.findByIdAndUpdate(dto.id, { $inc: { seenCount: -1 } });
  }

  async addToWatchlist(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $push: { watchlist: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  async removeFromWatchlist(userId: string, dto: MovieActionDto) {
    const user = await User.findByIdAndUpdate(userId, {
      $pull: { watchlist: dto.id },
    });
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  async rateMovie(userId: string, dto: RateMovieDto) {
    const validation = movieRatingSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    // Check for existing rating to determine if this is an update
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    const existingRating = user.ratings.find((r) => r.movie === dto.id);

    if (existingRating) {
      // Update: adjust ratingSum by the difference
      const diff = dto.rating - existingRating.rating;
      await Movie.findByIdAndUpdate(dto.id, {
        $inc: { ratingSum: diff },
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { ratings: { movie: dto.id } },
      });
    } else {
      // New rating: increment both count and sum
      await Movie.findByIdAndUpdate(dto.id, {
        $inc: { ratingCount: 1, ratingSum: dto.rating },
      });
    }

    await User.findByIdAndUpdate(userId, {
      $push: { ratings: { movie: dto.id, rating: dto.rating } },
    });

    // Compute avgRating from the atomic fields
    const movie = await Movie.findById(dto.id);
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }
    movie.avgRating = movie.ratingCount > 0
      ? Math.round(movie.ratingSum / movie.ratingCount * 10) / 10
      : 0;
    await movie.save();
  }

  async deleteRating(userId: string, dto: MovieActionDto) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    const existingRating = user.ratings.find((r) => r.movie === dto.id);
    if (!existingRating) {
      throw new Error('Rating not found.');
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { ratings: { movie: dto.id } },
    });

    const movie = await Movie.findByIdAndUpdate(
      dto.id,
      { $inc: { ratingCount: -1, ratingSum: -existingRating.rating } },
      { new: true }
    );

    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }

    movie.avgRating = movie.ratingCount > 0
      ? Math.round(movie.ratingSum / movie.ratingCount * 10) / 10
      : 0;
    await movie.save();
  }
}
