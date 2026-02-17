import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app/app';
import { Movie, movieSchema } from '@/movies';
import { Quote } from '@/quotes';
import { User } from '@/users';

describe('Movie API Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let movieId: string;

  beforeAll(async () => {
    // Create admin user
    const adminSalt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('AdminPass123', adminSalt);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    await admin.save();
    adminToken = admin.generateAuthToken();

    // Create regular user
    const userSalt = await bcrypt.genSalt(10);
    const userPassword = await bcrypt.hash('UserPass123', userSalt);
    const user = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    await user.save();
    userToken = user.generateAuthToken();
  });

  beforeEach(async () => {
    await Movie.deleteMany({});
    await Quote.deleteMany({});
  });

  afterAll(async () => {
    await Movie.deleteMany({});
    await Quote.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/movies - Get All Movies', () => {
    it('should return all movies in shuffled order', async () => {
      await Movie.create([
        {
          title: 'Movie A',
          director: 'Director Z',
          date: '2020',
          runtime: '120 min',
          rating: 'PG-13',
          img: 'https://example.com/a.jpg',
        },
        {
          title: 'Movie B',
          director: 'Director A',
          date: '2021',
          runtime: '100 min',
          rating: 'R',
          img: 'https://example.com/b.jpg',
        },
      ]);

      const response = await request(app).get('/api/movies').expect(200);

      expect(response.body).toHaveLength(2);
      const titles = response.body.map((m: any) => m.title);
      expect(titles).toContain('Movie A');
      expect(titles).toContain('Movie B');
    });

    it('should return empty array when no movies exist', async () => {
      const response = await request(app).get('/api/movies').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should type-check movie response structure', async () => {
      await Movie.create({
        title: 'Type Check Movie',
        director: 'Director Name',
        date: '2022',
        runtime: '110 min',
        rating: 'PG',
        img: 'https://example.com/movie.jpg',
      });

      const response = await request(app).get('/api/movies').expect(200);

      const movie = response.body[0];
      expect(movie).toHaveProperty('title');
      expect(movie).toHaveProperty('director');
      expect(movie).toHaveProperty('date');
      expect(movie).toHaveProperty('runtime');
      expect(movie).toHaveProperty('rating');
      expect(typeof movie.title).toBe('string');
      expect(typeof movie.director).toBe('string');
    });
  });

  describe('POST /api/movies/getMovies - Get Movies With Sorting', () => {
    beforeEach(async () => {
      await Movie.create([
        {
          title: 'Alpha Movie',
          director: 'Zed Director',
          date: '2023',
          runtime: '120 min',
          rating: 'R',
        },
        {
          title: 'Zeta Movie',
          director: 'Alpha Director',
          date: '2020',
          runtime: '100 min',
          rating: 'PG',
        },
      ]);
    });

    it('should sort movies by title ascending', async () => {
      const response = await request(app)
        .post('/api/movies/getMovies')
        .send({ category: 'title', direction: 1 })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Alpha Movie');
      expect(response.body[1].title).toBe('Zeta Movie');
    });

    it('should sort movies by title descending', async () => {
      const response = await request(app)
        .post('/api/movies/getMovies')
        .send({ category: 'title', direction: -1 })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Zeta Movie');
      expect(response.body[1].title).toBe('Alpha Movie');
    });

    it('should sort movies by date', async () => {
      const response = await request(app)
        .post('/api/movies/getMovies')
        .send({ category: 'date', direction: 1 })
        .expect(200);

      expect(response.body[0].date).toBe('2020');
      expect(response.body[1].date).toBe('2023');
    });

    it('should return all movies in shuffled order when no sort params given', async () => {
      const response = await request(app)
        .post('/api/movies/getMovies')
        .send({})
        .expect(200);

      expect(response.body).toHaveLength(2);
      const titles = response.body.map((m: any) => m.title);
      expect(titles).toContain('Alpha Movie');
      expect(titles).toContain('Zeta Movie');
    });
  });

  describe('POST /api/movies - Create Movie', () => {
    it('should create a new movie with admin token', async () => {
      const newMovie = {
        title: 'New Movie',
        director: 'John Director',
        description: 'A great movie',
        date: '2023',
        runtime: '130 min',
        rating: 'R',
        img: 'https://example.com/new.jpg',
        genres: ['Action', 'Thriller'],
      };

      await request(app)
        .post('/api/movies')
        .set('x-auth-token', adminToken)
        .send(newMovie)
        .expect(200);

      const movie = await Movie.findOne({ title: 'New Movie' });
      expect(movie).toBeTruthy();
      expect(movie?.director).toBe('John Director');
      expect(movie?.genres).toEqual(['Action', 'Thriller']);
    });

    it('should validate movie input with Zod schema', () => {
      const validMovie = {
        title: 'Valid Movie',
        director: 'Valid Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
      };

      const result = movieSchema.safeParse(validMovie);
      expect(result.success).toBe(true);
    });

    it('should reject movie creation without admin privileges', async () => {
      const newMovie = {
        title: 'Unauthorized Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app)
        .post('/api/movies')
        .set('x-auth-token', userToken)
        .send(newMovie)
        .expect(401);
    });

    it('should reject movie creation without authentication', async () => {
      const newMovie = {
        title: 'No Auth Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app).post('/api/movies').send(newMovie).expect(401);
    });

    it('should reject duplicate movie titles', async () => {
      const movie = {
        title: 'Duplicate Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app)
        .post('/api/movies')
        .set('x-auth-token', adminToken)
        .send(movie)
        .expect(200);

      const response = await request(app)
        .post('/api/movies')
        .set('x-auth-token', adminToken)
        .send(movie)
        .expect(400);

      expect(response.text).toContain('already registered');
    });

    it('should type-check movie creation input', () => {
      const movieData = {
        title: 'Type Safe Movie',
        director: 'Type Director',
        date: '2023',
        runtime: '115 min',
        rating: 'PG-13',
        description: 'A type-safe movie',
        genres: ['Drama'],
      };

      const validation = movieSchema.safeParse(movieData);
      if (validation.success) {
        const typedData = validation.data;
        expect(typedData.title).toBe('Type Safe Movie');
        expect(typedData.director).toBe('Type Director');
        expect(Array.isArray(typedData.genres)).toBe(true);
      }
    });

    it('should reject movie with missing required fields', async () => {
      const incompleteMovie = {
        title: 'Incomplete Movie',
      };

      await request(app)
        .post('/api/movies')
        .set('x-auth-token', adminToken)
        .send(incompleteMovie)
        .expect(400);
    });
  });

  describe('GET /api/movies/findByID/:id - Get Movie by ID', () => {
    beforeEach(async () => {
      const movie = await Movie.create({
        title: 'Test Movie',
        director: 'Test Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
        img: 'https://example.com/test.jpg',
      });
      movieId = movie._id.toString();
    });

    it('should return movie by valid ID', async () => {
      const response = await request(app)
        .get(`/api/movies/findByID/${movieId}`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Test Movie');
      expect(response.body).toHaveProperty('director', 'Test Director');
    });

    it('should return 404 for non-existent movie ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app).get(`/api/movies/findByID/${fakeId}`).expect(404);
    });
  });

  describe('GET /api/movies/findByTitle/:title - Find Movies by Title Param', () => {
    beforeEach(async () => {
      await Movie.create([
        {
          title: 'The Great Escape',
          director: 'Director A',
          date: '2020',
          runtime: '120 min',
          rating: 'PG',
        },
        {
          title: 'Great Expectations',
          director: 'Director B',
          date: '2021',
          runtime: '110 min',
          rating: 'PG-13',
        },
        {
          title: 'Something Else',
          director: 'Director C',
          date: '2022',
          runtime: '100 min',
          rating: 'R',
        },
      ]);
    });

    it('should find movies by partial title via URL param', async () => {
      const response = await request(app)
        .get('/api/movies/findByTitle/Great')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should be case-insensitive', async () => {
      const response = await request(app)
        .get('/api/movies/findByTitle/great')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/movies/findByTitle/Nonexistent')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/movies/findByTitle - Search Movies by Title', () => {
    beforeEach(async () => {
      await Movie.create([
        {
          title: 'The Great Movie',
          director: 'Director A',
          date: '2020',
          runtime: '120 min',
          rating: 'PG',
        },
        {
          title: 'Great Adventure',
          director: 'Director B',
          date: '2021',
          runtime: '110 min',
          rating: 'PG-13',
        },
        {
          title: 'Different Title',
          director: 'Director C',
          date: '2022',
          runtime: '100 min',
          rating: 'R',
        },
      ]);
    });

    it('should find movies by partial title match', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ title: 'Great', category: 'title', direction: 1 })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.some((m: any) => m.title === 'The Great Movie')).toBe(true);
      expect(response.body.some((m: any) => m.title === 'Great Adventure')).toBe(true);
    });

    it('should return all movies when no title provided', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ category: 'director', direction: 1 })
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should be case-insensitive in search', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ title: 'great', category: 'title', direction: 1 })
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should sort results by specified category and direction', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ title: 'Great', category: 'title', direction: -1 })
        .expect(200);

      expect(response.body[0].title).toBe('The Great Movie');
      expect(response.body[1].title).toBe('Great Adventure');
    });

    it('should default to director sort when no category provided', async () => {
      const response = await request(app)
        .post('/api/movies/findByTitle')
        .send({ title: 'Great' })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].director).toBe('Director A');
      expect(response.body[1].director).toBe('Director B');
    });
  });

  describe('PUT /api/movies/:id - Update Movie', () => {
    beforeEach(async () => {
      const movie = await Movie.create({
        title: 'Update Test Movie',
        director: 'Original Director',
        date: '2020',
        runtime: '100 min',
        rating: 'PG',
      });
      movieId = (movie._id as any).toString();
    });

    it('should update movie with admin token', async () => {
      const updateData = {
        title: 'Update Test Movie',
        director: 'Updated Director',
        date: '2020',
        runtime: '110 min',
        rating: 'PG-13',
      };

      await request(app)
        .put(`/api/movies/${movieId}`)
        .set('x-auth-token', adminToken)
        .send(updateData)
        .expect(200);

      const movie = await Movie.findById(movieId);
      expect(movie?.director).toBe('Updated Director');
      expect(movie?.runtime).toBe('110 min');
    });

    it('should reject update without admin privileges', async () => {
      const updateData = {
        title: 'Update Test Movie',
        director: 'Unauthorized Update',
        date: '2020',
        runtime: '100 min',
        rating: 'PG',
      };

      await request(app)
        .put(`/api/movies/${movieId}`)
        .set('x-auth-token', userToken)
        .send(updateData)
        .expect(401);
    });

    it('should reject update without authentication', async () => {
      await request(app)
        .put(`/api/movies/${movieId}`)
        .send({ title: 'No Auth', director: 'Dir', date: '2020', runtime: '100 min', rating: 'PG' })
        .expect(401);
    });

    it('should return 400 for non-existent movie ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .put(`/api/movies/${fakeId}`)
        .set('x-auth-token', adminToken)
        .send({ title: 'Ghost', director: 'Dir', date: '2020', runtime: '100 min', rating: 'PG' })
        .expect(400);
    });
  });

  describe('GET /api/movies/avgRating/:id - Get Average Rating', () => {
    beforeEach(async () => {
      const movie = await Movie.create({
        title: 'Rating Test Movie',
        director: 'Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
        avgRating: 4,
        ratingCount: 3,
        ratingSum: 12,
      });
      movieId = (movie._id as any).toString();
    });

    it('should return correct average rating', async () => {
      const response = await request(app)
        .get(`/api/movies/avgRating/${movieId}`)
        .expect(200);

      const avgRating = parseFloat(response.text);
      expect(avgRating).toBe(4);
    });

    it('should return 0 for movie with no ratings', async () => {
      const newMovie = await Movie.create({
        title: 'No Ratings Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      });

      const response = await request(app)
        .get(`/api/movies/avgRating/${newMovie._id}`)
        .expect(200);

      expect(response.text).toBe('0');
    });

    it('should return 404 for non-existent movie', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .get(`/api/movies/avgRating/${fakeId}`)
        .expect(404);
    });

    it('should return decimal average rating', async () => {
      const movie = await Movie.create({
        title: 'Decimal Rating Movie',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
        avgRating: 3.5,
        ratingCount: 4,
        ratingSum: 14,
      });

      const response = await request(app)
        .get(`/api/movies/avgRating/${movie._id}`)
        .expect(200);

      expect(parseFloat(response.text)).toBe(3.5);
    });
  });

  describe('GET /api/movies/updateRatings - Legacy Endpoint', () => {
    it('should return 200 (legacy no-op)', async () => {
      await request(app)
        .get('/api/movies/updateRatings')
        .set('x-auth-token', adminToken)
        .expect(200);
    });

    it('should reject without authentication', async () => {
      await request(app)
        .get('/api/movies/updateRatings')
        .expect(401);
    });
  });

  describe('GET /api/movies/quote - Get Quote', () => {
    it('should return a recent quote if one exists', async () => {
      await Quote.create({
        quote: 'Test quote',
        subquote: 'Test subquote',
        createdOn: new Date(),
      });

      const response = await request(app)
        .get('/api/movies/quote')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].quote).toBe('Test quote');
      expect(response.body[0].subquote).toBe('Test subquote');
    });

    it('should fall back to hardcoded quote when no recent quote exists', async () => {
      const response = await request(app)
        .get('/api/movies/quote')
        .expect(200);

      // Should return a hardcoded quote object with quote and subquote
      expect(response.body).toHaveProperty('quote');
      expect(response.body).toHaveProperty('subquote');
    });

    it('should not return quotes older than 7 days', async () => {
      await Quote.create({
        quote: 'Old quote',
        subquote: 'Old subquote',
        createdOn: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .get('/api/movies/quote')
        .expect(200);

      // Should fall back to hardcoded since the DB quote is too old
      if (Array.isArray(response.body)) {
        expect(response.body[0]?.quote).not.toBe('Old quote');
      } else {
        expect(response.body).toHaveProperty('quote');
      }
    });
  });

  describe('POST /api/movies/quote - Create Quote (Admin)', () => {
    it('should create a new quote with admin token', async () => {
      const response = await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', adminToken)
        .send({ quote: 'New quote', subquote: 'New subquote' })
        .expect(200);

      expect(response.body).toHaveProperty('quote', 'New quote');
      expect(response.body).toHaveProperty('subquote', 'New subquote');

      const quote = await Quote.findOne({ quote: 'New quote' });
      expect(quote).toBeTruthy();
    });

    it('should reject quote creation without admin privileges', async () => {
      await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', userToken)
        .send({ quote: 'User quote', subquote: 'Sub' })
        .expect(401);
    });

    it('should reject quote creation without authentication', async () => {
      await request(app)
        .post('/api/movies/quote')
        .send({ quote: 'No auth quote', subquote: 'Sub' })
        .expect(401);
    });

    it('should reject invalid quote data', async () => {
      await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', adminToken)
        .send({ quote: '' })
        .expect(400);
    });
  });

  describe('Type Safety Tests', () => {
    it('should validate complete movie schema', () => {
      const completeMovie = {
        title: 'Complete Movie',
        director: 'Complete Director',
        description: 'A complete description',
        date: '2023',
        runtime: '120 min',
        rating: 'R',
        img: 'https://example.com/img.jpg',
        genres: ['Action', 'Drama', 'Thriller'],
      };

      const validation = movieSchema.safeParse(completeMovie);
      expect(validation.success).toBe(true);

      if (validation.success) {
        expect(validation.data.title).toBe('Complete Movie');
        expect(validation.data.genres).toHaveLength(3);
      }
    });

    it('should reject invalid movie schema', () => {
      const invalidMovie = {
        title: '', // Too short
        director: 'Director',
        date: '2023',
        runtime: '120 min',
        rating: 'PG',
      };

      const validation = movieSchema.safeParse(invalidMovie);
      expect(validation.success).toBe(false);
    });
  });
});
