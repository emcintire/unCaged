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

  async getAverageRating(id: string) {
    const movie = await this.findMovieById(id);
    return movie.avgRating ?? 0;
  }
}
