import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app/app';
import { Movie } from '@/movies';
import { Review } from '@/reviews';
import { User } from '@/users';
import { reviewSchema } from '@/reviews';

describe('Review API Endpoints', () => {
  let adminToken: string;
  let userToken: string;
  let secondUserToken: string;
  let userId: string;
  let secondUserId: string;
  let movieId: string;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);

    const admin = new User({
      name: 'Admin User',
      email: 'reviewadmin@example.com',
      password: await bcrypt.hash('AdminPass123', salt),
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    await admin.save();
    adminToken = admin.generateAuthToken();

    const user = new User({
      name: 'Review User',
      email: 'reviewer@example.com',
      password: await bcrypt.hash('UserPass123', salt),
      isAdmin: false,
      img: 'https://i.imgur.com/user.png',
    });
    await user.save();
    userToken = user.generateAuthToken();
    userId = user._id.toString();

    const secondUser = new User({
      name: 'Other User',
      email: 'other@example.com',
      password: await bcrypt.hash('UserPass123', salt),
      isAdmin: false,
      img: 'https://i.imgur.com/other.png',
    });
    await secondUser.save();
    secondUserToken = secondUser.generateAuthToken();
    secondUserId = secondUser._id.toString();

    const movie = await Movie.create({
      title: 'Review Test Movie',
      director: 'Test Director',
      date: '2023',
      runtime: '120 min',
      rating: 'R',
    });
    movieId = movie._id.toString();
  });

  describe('POST /api/movies/:movieId/reviews - Create Review', () => {
    it('should create a review with text only', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ text: 'Great movie, loved every minute!' })
        .expect(200);

      expect(response.body).toHaveProperty('text', 'Great movie, loved every minute!');
      expect(response.body).toHaveProperty('movieId', movieId);
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('isSpoiler', false);
      expect(response.body).toHaveProperty('createdOn');
    });

    it('should create a review with a snapshot rating', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ text: 'Solid film.', rating: 4 })
        .expect(200);

      expect(response.body).toHaveProperty('rating', 4);
      expect(response.body).toHaveProperty('text', 'Solid film.');
    });

    it('should create a review marked as spoiler', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ text: 'The ending was wild!', isSpoiler: true })
        .expect(200);

      expect(response.body).toHaveProperty('isSpoiler', true);
    });

    it('should create a review with all fields', async () => {
      const response = await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ text: 'Amazing!', rating: 5, isSpoiler: false })
        .expect(200);

      expect(response.body.text).toBe('Amazing!');
      expect(response.body.rating).toBe(5);
      expect(response.body.isSpoiler).toBe(false);
    });

    it('should allow multiple reviews from the same user on the same movie', async () => {
      await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ text: 'First viewing thoughts' })
        .expect(200);

      await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ text: 'Second viewing - even better!' })
        .expect(200);

      const reviews = await Review.find({ movieId, userId });
      expect(reviews).toHaveLength(2);
    });

    it('should reject review without authentication', async () => {
      await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .send({ text: 'No auth review' })
        .expect(401);
    });

    it('should reject review with empty text', async () => {
      await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ text: '' })
        .expect(400);
    });

    it('should reject review with missing text', async () => {
      await request(app)
        .post(`/api/movies/${movieId}/reviews`)
        .set('x-auth-token', userToken)
        .send({ rating: 3 })
        .expect(400);
    });
  });

  describe('GET /api/movies/:movieId/reviews - Get Reviews', () => {
    it('should return all reviews for a movie', async () => {
      await Review.create([
        { userId, movieId, text: 'Review 1' },
        { userId: secondUserId, movieId, text: 'Review 2', rating: 4 },
      ]);

      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return reviews sorted by newest first', async () => {
      await Review.create({
        userId,
        movieId,
        text: 'Older review',
        createdOn: new Date('2024-01-01'),
      });
      await Review.create({
        userId: secondUserId,
        movieId,
        text: 'Newer review',
        createdOn: new Date('2025-01-01'),
      });

      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body[0].text).toBe('Newer review');
      expect(response.body[1].text).toBe('Older review');
    });

    it('should include user name and avatar in reviews', async () => {
      await Review.create({ userId, movieId, text: 'My review' });

      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body[0]).toHaveProperty('userName', 'Review User');
      expect(response.body[0]).toHaveProperty('userImg', 'https://i.imgur.com/user.png');
    });

    it('should include spoiler flag in response', async () => {
      await Review.create({ userId, movieId, text: 'Spoiler!', isSpoiler: true });

      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body[0].isSpoiler).toBe(true);
    });

    it('should include snapshot rating in response', async () => {
      await Review.create({ userId, movieId, text: 'Rated review', rating: 3 });

      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body[0].rating).toBe(3);
    });

    it('should return empty array when no reviews exist', async () => {
      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should not require authentication', async () => {
      await Review.create({ userId, movieId, text: 'Public review' });

      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('should only return reviews for the specified movie', async () => {
      const otherMovie = await Movie.create({
        title: 'Other Movie',
        director: 'Other Director',
        date: '2024',
        runtime: '90 min',
        rating: 'PG',
      });

      await Review.create([
        { userId, movieId, text: 'Review for movie 1' },
        { userId, movieId: otherMovie._id.toString(), text: 'Review for movie 2' },
      ]);

      const response = await request(app)
        .get(`/api/movies/${movieId}/reviews`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].text).toBe('Review for movie 1');
    });
  });

  describe('DELETE /api/movies/:movieId/reviews/:reviewId - Delete Review', () => {
    let reviewId: string;

    beforeEach(async () => {
      const review = await Review.create({
        userId,
        movieId,
        text: 'Deletable review',
      });
      reviewId = review._id.toString();
    });

    it('should allow author to delete their own review', async () => {
      await request(app)
        .delete(`/api/movies/${movieId}/reviews/${reviewId}`)
        .set('x-auth-token', userToken)
        .expect(200);

      const review = await Review.findById(reviewId);
      expect(review).toBeNull();
    });

    it('should allow admin to delete any review', async () => {
      await request(app)
        .delete(`/api/movies/${movieId}/reviews/${reviewId}`)
        .set('x-auth-token', adminToken)
        .expect(200);

      const review = await Review.findById(reviewId);
      expect(review).toBeNull();
    });

    it('should reject deletion by non-author non-admin', async () => {
      const response = await request(app)
        .delete(`/api/movies/${movieId}/reviews/${reviewId}`)
        .set('x-auth-token', secondUserToken)
        .expect(401);

      expect(response.text).toContain('Not authorized');

      const review = await Review.findById(reviewId);
      expect(review).toBeTruthy();
    });

    it('should reject deletion without authentication', async () => {
      await request(app)
        .delete(`/api/movies/${movieId}/reviews/${reviewId}`)
        .expect(401);
    });

    it('should return 400 for non-existent review ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .delete(`/api/movies/${movieId}/reviews/${fakeId}`)
        .set('x-auth-token', userToken)
        .expect(400);
    });
  });

  describe('Review Schema Validation', () => {
    it('should validate correct review data', () => {
      const result = reviewSchema.safeParse({
        text: 'Great movie!',
        rating: 4,
        isSpoiler: false,
      });
      expect(result.success).toBe(true);
    });

    it('should validate review with text only', () => {
      const result = reviewSchema.safeParse({ text: 'Just text' });
      expect(result.success).toBe(true);
    });

    it('should reject empty text', () => {
      const result = reviewSchema.safeParse({ text: '' });
      expect(result.success).toBe(false);
    });

    it('should reject rating above 5', () => {
      const result = reviewSchema.safeParse({ text: 'Review', rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject rating below 0', () => {
      const result = reviewSchema.safeParse({ text: 'Review', rating: -1 });
      expect(result.success).toBe(false);
    });

    it('should accept rating of 0', () => {
      const result = reviewSchema.safeParse({ text: 'Review', rating: 0 });
      expect(result.success).toBe(true);
    });

    it('should accept rating of 5', () => {
      const result = reviewSchema.safeParse({ text: 'Review', rating: 5 });
      expect(result.success).toBe(true);
    });

    it('should reject text exceeding max length', () => {
      const result = reviewSchema.safeParse({ text: 'a'.repeat(2049) });
      expect(result.success).toBe(false);
    });
  });
});
