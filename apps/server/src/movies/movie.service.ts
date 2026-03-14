import { User } from '@/users';
import { HttpError, validateSchema } from '@/utils';

import { Movie } from './movie.model';
import { movieSchema } from './movie.schema';
import type { CreateMovieDto } from './schemas';

export class MovieService {
  async getAllMovies() {
    return await Movie.find().sort({ title: 1 });
  }

  async findMovieById(id: string) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new HttpError(404, 'The movie with the given ID was not found.', 'MOVIE_NOT_FOUND');
    }
    return movie;
  }

  async createMovie(dto: CreateMovieDto) {
    validateSchema(movieSchema, dto);

    const movieAlreadyExists = await Movie.exists({ title: dto.title });
    if (movieAlreadyExists) {
      throw new HttpError(409, 'Movie already registered', 'MOVIE_ALREADY_EXISTS');
    }

    const movie = new Movie({
      title: dto.title,
      director: dto.director,
      description: dto.description,
      date: dto.date,
      rating: dto.rating,
      runtime: dto.runtime,
      img: dto.img,
      genres: dto.genres,
    });

    await movie.save();
  }

  async getPopularMovies() {
    return await Movie.aggregate([
      {
        $addFields: {
          score: {
            $add: [
              { $ifNull: ['$seenCount', 0] },
              { $multiply: [{ $ifNull: ['$favoriteCount', 0] }, 2] },
              { $multiply: [{ $ifNull: ['$avgRating', 0] }, { $ifNull: ['$ratingCount', 0] }] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
      { $project: { score: 0 } },
    ]);
  }

  async getStaffPicks() {
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      throw new HttpError(500, 'No admin user found.', 'ADMIN_USER_NOT_FOUND');
    }
    return await Movie.find({ _id: { $in: admin.favorites } }).sort({ title: 1 });
  }

  async getRecommendations(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found.', 'USER_NOT_FOUND');
    }

    const highlyRatedIds = user.ratings.filter((r) => r.rating >= 4).map((r) => r.movie);
    const likedIds = [...new Set([...user.favorites, ...highlyRatedIds])];

    if (likedIds.length === 0) {
      return await Movie.find({ _id: { $nin: user.seen } }).sort({ avgRating: -1 }).limit(20);
    }

    const likedMovies = await Movie.find({ _id: { $in: likedIds } }, { genres: 1 });
    const genreCount: Record<string, number> = {};
    for (const movie of likedMovies) {
      for (const genre of movie.genres) {
        genreCount[genre] = (genreCount[genre] ?? 0) + 1;
      }
    }

    const excludedIds = [...new Set([...user.seen, ...likedIds])];
    const candidates = await Movie.find({
      _id: { $nin: excludedIds },
      genres: { $in: Object.keys(genreCount) },
    });

    candidates.sort((a, b) => {
      const scoreA = a.genres.reduce((sum, g) => sum + (genreCount[g] ?? 0), 0);
      const scoreB = b.genres.reduce((sum, g) => sum + (genreCount[g] ?? 0), 0);
      return scoreB - scoreA;
    });

    return candidates.slice(0, 20);
  }

  async getAverageRating(id: string) {
    const movie = await this.findMovieById(id);
    return movie.avgRating ?? 0;
  }
}
