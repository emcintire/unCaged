import { Movie } from './movie.model';
import { movieSchema } from './movie.schema';
import { User } from '@/users';
import type {
  CreateMovieDto,
  UpdateMovieDto,
  GetMoviesDto,
  FindByTitleDto,
} from './types';
import { escapeRegex } from '@/util';

export class MovieService {
  async getAllMovies(dto?: GetMoviesDto) {
    if (dto?.category && dto?.direction) {
      return await Movie.find().sort({
        [dto.category]: dto.direction,
      });
    }

    return await Movie.find().sort({ title: 1 });
  }

  async findMovieById(id: string) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }
    return movie;
  }

  async findMoviesByTitleParam(title: string) {
    return await Movie.find({
      title: { $regex: escapeRegex(title), $options: 'i' },
    });
  }

  async findMoviesByTitle(dto: FindByTitleDto) {
    if (dto.category && dto.direction) {
      if (dto.title) {
        return await Movie.find({
          title: { $regex: escapeRegex(dto.title), $options: 'i' },
        }).sort({
          [dto.category]: dto.direction,
        });
      } else {
        return await Movie.find().sort({
          [dto.category]: dto.direction,
        });
      }
    }

    // Default sort when category/direction not provided
    if (dto.title) {
      return await Movie.find({
        title: { $regex: escapeRegex(dto.title), $options: 'i' },
      }).sort('director');
    } else {
      return await Movie.find().sort('director');
    }
  }

  async createMovie(dto: CreateMovieDto) {
    const validation = movieSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const movieAlreadyExists = await Movie.findOne({ title: dto.title }) != null;
    if (movieAlreadyExists) {
      throw new Error('Movie already registered');
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

  async updateMovie(id: string, dto: UpdateMovieDto) {
    const validation = movieSchema.safeParse(dto);
    if (!validation.success) {
      throw new Error(validation.error.issues[0].message);
    }

    const movie = await Movie.findByIdAndUpdate(id, { $set: dto });
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }
  }

  async getPopularMovies() {
    const movies = await Movie.find();

    const scored = movies.map((movie) => {
      const score = (movie.seenCount || 0)
        + ((movie.favoriteCount || 0) * 2)
        + ((movie.avgRating || 0) * (movie.ratingCount || 0));
      return { movie, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map((s) => s.movie);
  }

  async getStaffPicks() {
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      throw new Error('No admin user found.');
    }
    return await Movie.find({ _id: { $in: admin.favorites } }).sort({ title: 1 });
  }

  async getAverageRating(id: string) {
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new Error('The movie with the given ID was not found.');
    }

    return JSON.stringify(movie.avgRating || 0);
  }
}
