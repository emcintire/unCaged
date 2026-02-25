import bcrypt from 'bcrypt';
import request from 'supertest';

import { Movie } from '@/movies';
import { Review } from '@/reviews';
import { User } from '@/users';
import { signAccessToken } from '@/utils';

import app from '../app/app';

describe('Reviews API', () => {
  let adminToken: string;
  let userToken: string;
  let otherUserToken: string;
  let movieId: string;
  let userId: string;

  beforeEach(async () => {
    await Promise.all([Review.deleteMany({}), Movie.deleteMany({}), User.deleteMany({})]);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin-reviews@example.com',
      password: await bcrypt.hash('AdminPass123', 10),
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    const user = await User.create({
      name: 'Reviewer',
      email: 'reviewer@example.com',
      password: await bcrypt.hash('UserPass123', 10),
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    const other = await User.create({
      name: 'Other',
      email: 'other-reviewer@example.com',
      password: await bcrypt.hash('UserPass123', 10),
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    const movie = await Movie.create({
      title: 'Reviewable Movie',
      director: 'Director',
      description: 'Description',
      date: '2024',
      runtime: '120 min',
      rating: 'PG-13',
      img: 'https://example.com/movie.jpg',
    });

    adminToken = signAccessToken({ sub: admin._id.toString(), isAdmin: true });
    userToken = signAccessToken({ sub: user._id.toString(), isAdmin: false });
    otherUserToken = signAccessToken({ sub: other._id.toString(), isAdmin: false });
    movieId = movie._id.toString();
    userId = user._id.toString();
  });

  afterAll(async () => {
    await Promise.all([Review.deleteMany({}), Movie.deleteMany({}), User.deleteMany({})]);
  });

  it('POST /api/reviews creates review for authenticated user', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ movieId, text: 'Great movie', rating: 4 })
      .expect(201);

    expect(response.body.text).toBe('Great movie');
    expect(response.body.movieId).toBe(movieId);
    expect(response.body.userId).toBe(userId);
  });

  it('GET /api/reviews returns paginated movie reviews', async () => {
    await Review.create({ userId, movieId, text: 'One review', rating: 5 });
    const response = await request(app).get(`/api/reviews?movieId=${movieId}`).expect(200);

    expect(response.body).toHaveProperty('reviews');
    expect(response.body).toHaveProperty('total');
    expect(response.body.reviews).toHaveLength(1);
    expect(response.body.total).toBe(1);
  });

  it('PUT /api/reviews/:id/like toggles like state', async () => {
    const review = await Review.create({ userId, movieId, text: 'Like me' });

    const first = await request(app)
      .put(`/api/reviews/${review._id.toString()}/like`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(200);
    expect(first.body.liked).toBe(true);

    const second = await request(app)
      .put(`/api/reviews/${review._id.toString()}/like`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(200);
    expect(second.body.liked).toBe(false);
  });

  it('DELETE /api/reviews/:reviewId enforces ownership/admin permissions', async () => {
    const review = await Review.create({ userId, movieId, text: 'Delete me' });

    await request(app)
      .delete(`/api/reviews/${review._id.toString()}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(403);

    await request(app)
      .delete(`/api/reviews/${review._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('GET /api/reviews/admin requires admin', async () => {
    await request(app)
      .get('/api/reviews/admin')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app)
      .get('/api/reviews/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('GET /api/reviews validates required movieId query', async () => {
    const response = await request(app).get('/api/reviews').expect(400);
    expect(response.body.code).toBe('MOVIE_ID_REQUIRED');
  });

  it('POST /api/reviews/:reviewId/report blocks self-report and duplicate report', async () => {
    const review = await Review.create({ userId, movieId, text: 'Self report test' });

    await request(app)
      .post(`/api/reviews/${review._id.toString()}/report`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(400);

    await request(app)
      .post(`/api/reviews/${review._id.toString()}/report`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(200);

    const duplicate = await request(app)
      .post(`/api/reviews/${review._id.toString()}/report`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(409);

    expect(duplicate.body.code).toBe('REVIEW_ALREADY_REPORTED');
  });

  it('PUT /api/reviews/:reviewId/unflag requires admin and clears flags', async () => {
    const review = await Review.create({
      userId,
      movieId,
      text: 'Flagged review',
      isFlagged: true,
      flaggedBy: [userId],
    });

    await request(app)
      .put(`/api/reviews/${review._id.toString()}/unflag`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    await request(app)
      .put(`/api/reviews/${review._id.toString()}/unflag`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const updated = await Review.findById(review._id);
    expect(updated?.isFlagged).toBe(false);
    expect(updated?.flaggedBy).toEqual([]);
  });

  it('DELETE /api/reviews/:reviewId returns 404 for unknown review', async () => {
    await request(app)
      .delete('/api/reviews/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});