import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import request from 'supertest';
import app from '../app/app';
import { Movie } from '@/movies';
import { User, userSchema, loginSchema, updateUserSchema } from '@/users';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

describe('User API Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Clean up users before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users - User Registration', () => {
    it('should register a new user with valid data', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(200);

      expect(response.text).toBeTruthy();
      authToken = response.text;

      const user = await User.findOne({ email: newUser.email });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(newUser.name);
      expect(user?.email).toBe(newUser.email);
      expect(user?.password).not.toBe(newUser.password); // Should be hashed
    });

    it('should validate user input with Zod schema', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1',
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.text).toContain('email');
    });

    it('should reject weak password', async () => {
      const weakPasswordUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/users')
        .send(weakPasswordUser)
        .expect(400);

      expect(response.text).toContain('Password');
    });

    it('should reject duplicate email registration', async () => {
      const user = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'TestPass123',
      };

      await request(app).post('/api/users').send(user).expect(200);

      const response = await request(app)
        .post('/api/users')
        .send(user)
        .expect(400);

      expect(response.text).toContain('already registered');
    });

    it('should type-check user creation input', () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
      };

      const validation = userSchema.safeParse(userData);
      if (validation.success) {
        const typedData = validation.data;
        expect(typedData.name).toBe('Jane Doe');
        expect(typedData.email).toBe('jane@example.com');
      }
    });
  });

  describe('POST /api/users/login - User Login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Login Test',
        email: 'login@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      userId = user._id.toString();
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(200);

      expect(response.text).toBeTruthy();
      authToken = response.text;
    });

    it('should validate login input with Zod schema', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'ValidPass1',
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject login with invalid email', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'TestPass123',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(400);

      expect(response.text).toContain('Invalid email or password');
    });

    it('should reject login with wrong password', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'WrongPass123',
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(credentials)
        .expect(400);

      expect(response.text).toContain('Invalid email or password');
    });
  });

  describe('GET /api/users - Get User Profile', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Profile Test',
        email: 'profile@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      authToken = (user.generateAuthToken as any)();
      userId = (user._id as any).toString();
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('x-auth-token', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Profile Test');
      expect(response.body).toHaveProperty('email', 'profile@example.com');
      expect(response.body).toHaveProperty('_id', userId);
    });

    it('should reject request without token', async () => {
      await request(app).get('/api/users').expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app)
        .get('/api/users')
        .set('x-auth-token', 'invalid-token')
        .expect(400);
    });
  });

  describe('PUT /api/users - Update User', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Update Test',
        email: 'update@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      authToken = user.generateAuthToken();
      userId = user._id.toString();
    });

    it('should update user profile with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        img: 'https://i.imgur.com/newimage.png',
      };

      await request(app)
        .put('/api/users')
        .set('x-auth-token', authToken)
        .send(updateData)
        .expect(200);

      const user = await User.findById(userId);
      expect(user?.name).toBe('Updated Name');
      expect(user?.img).toBe('https://i.imgur.com/newimage.png');
    });

    it('should validate update input with Zod schema', () => {
      const updateData = {
        name: 'New Name',
        email: 'newemail@example.com',
      };

      const result = updateUserSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should type-check update data', () => {
      const updateData = {
        name: 'Type Check Name',
        img: 'https://example.com/img.png',
      };

      const validation = updateUserSchema.safeParse(updateData);
      if (validation.success) {
        const typedData = validation.data;
        expect(typeof typedData.name).toBe('string');
        expect(typeof typedData.img).toBe('string');
      }
    });

    it('should update user email', async () => {
      await request(app)
        .put('/api/users')
        .set('x-auth-token', authToken)
        .send({ email: 'newemail@example.com' })
        .expect(200);

      const user = await User.findById(userId);
      expect(user?.email).toBe('newemail@example.com');
    });

    it('should reject update without auth token', async () => {
      await request(app)
        .put('/api/users')
        .send({ name: 'No Auth' })
        .expect(401);
    });
  });

  describe('PUT /api/users/changePassword - Change Password', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Password Test',
        email: 'password@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      authToken = user.generateAuthToken();
      userId = user._id.toString();
    });

    it('should change password with valid current password', async () => {
      await request(app)
        .put('/api/users/changePassword')
        .set('x-auth-token', authToken)
        .send({ currentPassword: 'TestPass123', password: 'NewPass456' })
        .expect(200);

      // Verify new password works
      const user = await User.findById(userId);
      const isValid = await bcrypt.compare('NewPass456', user!.password);
      expect(isValid).toBe(true);
    });

    it('should reject change with wrong current password', async () => {
      const response = await request(app)
        .put('/api/users/changePassword')
        .set('x-auth-token', authToken)
        .send({ currentPassword: 'WrongPass123', password: 'NewPass456' })
        .expect(400);

      expect(response.text).toContain('Invalid password');
    });

    it('should change password without current password (reset flow)', async () => {
      await request(app)
        .put('/api/users/changePassword')
        .set('x-auth-token', authToken)
        .send({ password: 'NewPass456' })
        .expect(200);

      const user = await User.findById(userId);
      const isValid = await bcrypt.compare('NewPass456', user!.password);
      expect(isValid).toBe(true);
    });

    it('should reject change without auth token', async () => {
      await request(app)
        .put('/api/users/changePassword')
        .send({ password: 'NewPass456' })
        .expect(401);
    });
  });

  describe('POST /api/users/forgotPassword - Forgot Password', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Forgot Test',
        email: 'forgot@example.com',
        password: hashedPassword,
      });
      await user.save();
      userId = user._id.toString();

      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true),
      });
    });

    it('should send reset code for valid email', async () => {
      await request(app)
        .post('/api/users/forgotPassword')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      const user = await User.findById(userId);
      expect(user?.resetCode).toBeTruthy();
      expect(user?.resetCodeExpiry).toBeTruthy();
    });

    it('should reject forgot password for non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/forgotPassword')
        .send({ email: 'nonexistent@example.com' })
        .expect(400);

      expect(response.text).toContain('No user with that email');
    });

    it('should set reset code expiry to 15 minutes in the future', async () => {
      const before = Date.now();

      await request(app)
        .post('/api/users/forgotPassword')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      const user = await User.findById(userId);
      const expiry = user!.resetCodeExpiry!.getTime();
      // Expiry should be roughly 15 minutes from now
      expect(expiry).toBeGreaterThan(before + 14 * 60 * 1000);
      expect(expiry).toBeLessThanOrEqual(before + 16 * 60 * 1000);
    });
  });

  describe('POST /api/users/checkCode - Check Reset Code', () => {
    let resetCode: string;

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      resetCode = '123456';
      const hashedCode = await bcrypt.hash(resetCode, salt);

      const user = new User({
        name: 'Code Test',
        email: 'code@example.com',
        password: hashedPassword,
        resetCode: hashedCode,
        resetCodeExpiry: new Date(Date.now() + 15 * 60 * 1000),
      });
      await user.save();
      userId = user._id.toString();
    });

    it('should accept valid reset code', async () => {
      await request(app)
        .post('/api/users/checkCode')
        .send({ email: 'code@example.com', code: resetCode })
        .expect(200);

      // Reset code should be cleared after successful check
      const user = await User.findById(userId);
      expect(user?.resetCode).toBe('');
    });

    it('should reject invalid reset code', async () => {
      const response = await request(app)
        .post('/api/users/checkCode')
        .send({ email: 'code@example.com', code: '999999' })
        .expect(400);

      expect(response.text).toContain('Invalid Code');
    });

    it('should reject expired reset code', async () => {
      // Set expiry to the past
      await User.findByIdAndUpdate(userId, {
        resetCodeExpiry: new Date(Date.now() - 1000),
      });

      const response = await request(app)
        .post('/api/users/checkCode')
        .send({ email: 'code@example.com', code: resetCode })
        .expect(400);

      expect(response.text).toContain('expired');
    });

    it('should reject check code for non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/checkCode')
        .send({ email: 'nonexistent@example.com', code: resetCode })
        .expect(400);

      expect(response.text).toContain('No user with that email');
    });
  });

  describe('DELETE /api/users - Delete User', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Delete Test',
        email: 'delete@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
      });
      await user.save();
      authToken = (user.generateAuthToken as any)();
      userId = (user._id as any).toString();
    });

    it('should delete user account with valid token', async () => {
      await request(app)
        .delete('/api/users')
        .set('x-auth-token', authToken)
        .expect(200);

      const user = await User.findById(userId);
      expect(user).toBeNull();
    });

    it('should reject delete without auth token', async () => {
      await request(app).delete('/api/users').expect(401);
    });
  });

  describe('User Watchlist, Favorites, and Seen Operations', () => {
    let movieId: string;

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'List Test',
        email: 'lists@example.com',
        password: hashedPassword,
        img: 'https://i.imgur.com/9NYgErP.png',
        watchlist: [],
        favorites: [],
        seen: [],
      });
      await user.save();
      authToken = user.generateAuthToken();
      userId = user._id.toString();
      movieId = '507f1f77bcf86cd799439011'; // Mock movie ID
    });

    describe('Watchlist Operations', () => {
      it('should add movie to watchlist', async () => {
        await request(app)
          .put('/api/users/watchlist')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.watchlist).toContain(movieId);
      });

      it('should remove movie from watchlist', async () => {
        await User.findByIdAndUpdate(userId, {
          $push: { watchlist: movieId },
        });

        await request(app)
          .delete('/api/users/watchlist')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.watchlist).not.toContain(movieId);
      });

      it('should get watchlist with movie details', async () => {
        const movie = await Movie.create({
          title: 'Watchlist Movie',
          director: 'Director',
          date: '2023',
          runtime: '120 min',
          rating: 'R',
        });

        await User.findByIdAndUpdate(userId, {
          $push: { watchlist: movie._id.toString() },
        });

        const response = await request(app)
          .get('/api/users/watchlist')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Watchlist Movie');
      });

      it('should return empty array for empty watchlist', async () => {
        const response = await request(app)
          .get('/api/users/watchlist')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('Favorites Operations', () => {
      it('should add movie to favorites', async () => {
        await request(app)
          .put('/api/users/favorites')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.favorites).toContain(movieId);
      });

      it('should remove movie from favorites', async () => {
        await User.findByIdAndUpdate(userId, {
          $push: { favorites: movieId },
        });

        await request(app)
          .delete('/api/users/favorites')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.favorites).not.toContain(movieId);
      });

      it('should get favorites with movie details', async () => {
        const movie = await Movie.create({
          title: 'Favorite Movie',
          director: 'Director',
          date: '2023',
          runtime: '110 min',
          rating: 'PG-13',
        });

        await User.findByIdAndUpdate(userId, {
          $push: { favorites: movie._id.toString() },
        });

        const response = await request(app)
          .get('/api/users/favorites')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Favorite Movie');
      });

      it('should return empty array for empty favorites', async () => {
        const response = await request(app)
          .get('/api/users/favorites')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('Seen Operations', () => {
      it('should add movie to seen list', async () => {
        await request(app)
          .put('/api/users/seen')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.seen).toContain(movieId);
      });

      it('should remove movie from seen list', async () => {
        await User.findByIdAndUpdate(userId, {
          $push: { seen: movieId },
        });

        await request(app)
          .delete('/api/users/seen')
          .set('x-auth-token', authToken)
          .send({ id: movieId })
          .expect(200);

        const user = await User.findById(userId);
        expect(user?.seen).not.toContain(movieId);
      });

      it('should get seen movies with movie details', async () => {
        const movie = await Movie.create({
          title: 'Seen Movie',
          director: 'Director',
          date: '2023',
          runtime: '100 min',
          rating: 'PG',
        });

        await User.findByIdAndUpdate(userId, {
          $push: { seen: movie._id.toString() },
        });

        const response = await request(app)
          .get('/api/users/seen')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Seen Movie');
      });

      it('should return empty array for empty seen list', async () => {
        const response = await request(app)
          .get('/api/users/seen')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toEqual([]);
      });
    });

    describe('Unseen Movies', () => {
      it('should return movies not in seen list', async () => {
        const movie1 = await Movie.create({
          title: 'Seen Movie',
          director: 'Director A',
          date: '2020',
          runtime: '100 min',
          rating: 'PG',
        });
        await Movie.create({
          title: 'Unseen Movie',
          director: 'Director B',
          date: '2021',
          runtime: '110 min',
          rating: 'R',
        });

        await User.findByIdAndUpdate(userId, {
          $push: { seen: movie1._id.toString() },
        });

        const response = await request(app)
          .get('/api/users/unseen')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Unseen Movie');
      });

      it('should return all movies when none are seen', async () => {
        await Movie.create([
          {
            title: 'Movie 1',
            director: 'Dir 1',
            date: '2020',
            runtime: '100 min',
            rating: 'PG',
          },
          {
            title: 'Movie 2',
            director: 'Dir 2',
            date: '2021',
            runtime: '110 min',
            rating: 'R',
          },
        ]);

        const response = await request(app)
          .get('/api/users/unseen')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toHaveLength(2);
      });

      it('should return empty array when all movies are seen', async () => {
        const movie = await Movie.create({
          title: 'Only Movie',
          director: 'Director',
          date: '2023',
          runtime: '120 min',
          rating: 'PG',
        });

        await User.findByIdAndUpdate(userId, {
          $push: { seen: movie._id.toString() },
        });

        const response = await request(app)
          .get('/api/users/unseen')
          .set('x-auth-token', authToken)
          .expect(200);

        expect(response.body).toHaveLength(0);
      });
    });
  });

  describe('Rating Operations', () => {
    let movieId: string;

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const user = new User({
        name: 'Rating Test',
        email: 'rating@example.com',
        password: hashedPassword,
        ratings: [],
      });
      await user.save();
      authToken = user.generateAuthToken();
      userId = user._id.toString();

      const movie = await Movie.create({
        title: 'Rateable Movie',
        director: 'Director',
        date: '2023',
        runtime: '120 min',
        rating: 'R',
      });
      movieId = movie._id.toString();
    });

    it('should rate a movie', async () => {
      await request(app)
        .put('/api/users/rate')
        .set('x-auth-token', authToken)
        .send({ id: movieId, rating: 4 })
        .expect(200);

      const user = await User.findById(userId);
      expect(user?.ratings).toHaveLength(1);
      expect(user?.ratings[0].movie).toBe(movieId);
      expect(user?.ratings[0].rating).toBe(4);

      const movie = await Movie.findById(movieId);
      expect(movie?.ratingCount).toBe(1);
      expect(movie?.ratingSum).toBe(4);
    });

    it('should update existing rating (no duplicates)', async () => {
      // Rate first time
      await request(app)
        .put('/api/users/rate')
        .set('x-auth-token', authToken)
        .send({ id: movieId, rating: 3 })
        .expect(200);

      // Rate again with different score
      await request(app)
        .put('/api/users/rate')
        .set('x-auth-token', authToken)
        .send({ id: movieId, rating: 5 })
        .expect(200);

      const user = await User.findById(userId);
      expect(user?.ratings).toHaveLength(1);
      expect(user?.ratings[0].rating).toBe(5);

      const movie = await Movie.findById(movieId);
      expect(movie?.ratingCount).toBe(1);
      expect(movie?.ratingSum).toBe(5);
    });

    it('should get rated movies', async () => {
      await User.findByIdAndUpdate(userId, {
        $push: { ratings: { movie: movieId, rating: 4 } },
      });

      const response = await request(app)
        .get('/api/users/rate')
        .set('x-auth-token', authToken)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Rateable Movie');
    });

    it('should return empty array when no ratings', async () => {
      const response = await request(app)
        .get('/api/users/rate')
        .set('x-auth-token', authToken)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should delete a rating', async () => {
      // Add rating to user and set counts on movie
      await User.findByIdAndUpdate(userId, {
        $push: { ratings: { movie: movieId, rating: 4 } },
      });
      await Movie.findByIdAndUpdate(movieId, {
        $set: { ratingCount: 1, ratingSum: 4, avgRating: 4 },
      });

      await request(app)
        .delete('/api/users/rate')
        .set('x-auth-token', authToken)
        .send({ id: movieId })
        .expect(200);

      const user = await User.findById(userId);
      expect(user?.ratings).toHaveLength(0);

      const movie = await Movie.findById(movieId);
      expect(movie?.ratingCount).toBe(0);
      expect(movie?.ratingSum).toBe(0);
      expect(movie?.avgRating).toBe(0);
    });

    it('should reject rating without auth token', async () => {
      await request(app)
        .put('/api/users/rate')
        .send({ id: movieId, rating: 4 })
        .expect(401);
    });
  });

  describe('POST /api/users/filteredMovies - Filtered Movies', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('TestPass123', salt);

      const movie1 = await Movie.create({
        title: 'Action Movie',
        director: 'Director A',
        date: '2020',
        runtime: '120 min',
        rating: 'R',
      });
      const movie2 = await Movie.create({
        title: 'Comedy Movie',
        director: 'Director B',
        date: '2021',
        runtime: '100 min',
        rating: 'PG-13',
      });
      await Movie.create({
        title: 'Mandy',
        director: 'Panos Cosmatos',
        date: '2018',
        runtime: '121 min',
        rating: 'R',
      });

      const user = new User({
        name: 'Filter Test',
        email: 'filter@example.com',
        password: hashedPassword,
        seen: [movie1._id.toString()],
        watchlist: [movie2._id.toString()],
      });
      await user.save();
      authToken = user.generateAuthToken();
      userId = user._id.toString();
    });

    it('should filter unseen movies', async () => {
      const response = await request(app)
        .post('/api/users/filteredMovies')
        .set('x-auth-token', authToken)
        .send({ unseen: true })
        .expect(200);

      // movie1 is seen, so should get movie2 and Mandy
      expect(response.body).toHaveLength(2);
      const titles = response.body.map((m: any) => m.title);
      expect(titles).not.toContain('Action Movie');
    });

    it('should filter watchlist movies', async () => {
      const response = await request(app)
        .post('/api/users/filteredMovies')
        .set('x-auth-token', authToken)
        .send({ watchlist: true })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Comedy Movie');
    });

    it('should filter Mandy', async () => {
      const response = await request(app)
        .post('/api/users/filteredMovies')
        .set('x-auth-token', authToken)
        .send({ mandy: true })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Mandy');
    });

    it('should combine filters', async () => {
      const response = await request(app)
        .post('/api/users/filteredMovies')
        .set('x-auth-token', authToken)
        .send({ unseen: true, watchlist: true })
        .expect(200);

      // Unseen: Comedy Movie, Mandy. Then watchlist filter: Comedy Movie only
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Comedy Movie');
    });

    it('should return all movies with no filters', async () => {
      const response = await request(app)
        .post('/api/users/filteredMovies')
        .set('x-auth-token', authToken)
        .send({})
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should reject without auth token', async () => {
      await request(app)
        .post('/api/users/filteredMovies')
        .send({ unseen: true })
        .expect(401);
    });
  });
});
