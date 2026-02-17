import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { User } from './user.model';
import { Movie } from '@/movies';
import type {
  RegisterUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  LoginDto,
  ForgotPasswordDto,
  CheckCodeDto,
  MovieActionDto,
  RateMovieDto,
  FilteredMoviesDto
} from './types';
import { newUserSchema } from './newUser.schema';
import { loginSchema } from './login.schema';
import { updateUserSchema } from './updateUser.schema';
import { movieRatingSchema } from '@/movies';

export class UserService {
  async getUserById(userId: string) {
    const user = await User.findById(userId);
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

    return user.generateAuthToken();
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

    if (dto.currentPassword) {
      const validPassword = await bcrypt.compare(dto.currentPassword, user.password);
      if (!validPassword) {
        throw new Error('Invalid password');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(dto.password, salt);
    user.password = newPassword;
    await user.save();
  }

  async login(dto: LoginDto) {
    const validation = loginSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      throw new Error('Invalid email or password');
    }

    return user.generateAuthToken();
  }

  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
  }

  async getFavorites(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.favorites } });
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

  async getUnseenMovies(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    const unseen = [];
    const movies = await Movie.find();

    for (const movie of movies) {
      if (!user.seen.includes(String(movie._id))) {
        unseen.push(movie);
      }
    }

    return unseen;
  }

  async getSeenMovies(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.seen } });
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

  async getWatchlist(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.watchlist } });
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

  async getRatings(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }
    return await Movie.find({ _id: { $in: user.ratings.map((r) => r.movie) } });
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw new Error('No user with that email address');
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(randomNum, salt);

    user.resetCode = hashedCode;
    user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: dto.email,
      subject: 'Forgot Password',
      text: `Code: ${randomNum}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async checkResetCode(dto: CheckCodeDto) {
    const user = await User.findOne({ email: dto.email });
    if (!user) {
      throw new Error('No user with that email address');
    }

    if (user.resetCodeExpiry && user.resetCodeExpiry < new Date()) {
      throw new Error('Reset code has expired');
    }

    const validCode = await bcrypt.compare(dto.code, user.resetCode);
    if (!validCode) {
      throw new Error('Invalid Code');
    }

    user.resetCode = '';
    user.resetCodeExpiry = undefined;
    await user.save();
  }

  async getFilteredMovies(userId: string, dto: FilteredMoviesDto) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('The user with the given ID was not found.');
    }

    let movies = await Movie.find();

    if (dto.unseen) {
      movies = movies.filter((m) => !user.seen.includes(m.id));
    }

    if (dto.watchlist) {
      movies = movies.filter((m) => user.watchlist.includes(m.id));
    }

    if (dto.mandy) {
      movies = movies.filter((m) => m.title === 'Mandy');
    }

    return movies;
  }
}
