import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../app/app';
import { Movie } from '@/movies';
import { Review } from '@/reviews';
import { User } from '@/users';
import { signAccessToken } from '@/utils';

describe('Users API', () => {
  let token: string;
  let userId: string;
  let movieId: string;

  beforeEach(async () => {
    await User.deleteMany({});

    const user = await User.create({
      name: 'Existing User',
      email: 'existing-user@example.com',
      password: await bcrypt.hash('ExistingPass123', 10),
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    userId = user._id.toString();
    token = signAccessToken({ sub: userId, isAdmin: false });

    const movie = await Movie.create({
      title: 'User Test Movie',
      director: 'Director',
      description: 'Description',
      date: '2024',
      runtime: '120 min',
      rating: 'PG-13',
      img: 'https://example.com/movie.jpg',
    });
    movieId = movie._id.toString();
  });

  afterAll(async () => {
    await Promise.all([User.deleteMany({}), Movie.deleteMany({}), Review.deleteMany({})]);
  });

  it('POST /api/users registers new user and returns token payload', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'New User',
        email: 'new-user@example.com',
        password: 'NewUserPass123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('POST /api/users rejects duplicate email', async () => {
    await request(app)
      .post('/api/users')
      .send({ name: 'Dup', email: 'duplicate-user@example.com', password: 'DupPass123' })
      .expect(201);

    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Dup2', email: 'duplicate-user@example.com', password: 'DupPass123' })
      .expect(409);

    expect(response.body.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('GET /api/users returns current user for valid bearer token', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body._id).toBe(userId);
    expect(response.body.email).toBe('existing-user@example.com');
  });

  it('PUT /api/users updates profile fields', async () => {
    await request(app)
      .put('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', img: 'https://example.com/updated.png' })
      .expect(200);

    const updated = await User.findById(userId);
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.img).toBe('https://example.com/updated.png');
  });

  it('PUT /api/users/changePassword rejects wrong current password', async () => {
    const response = await request(app)
      .put('/api/users/changePassword')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongPass123', password: 'BrandNewPass123' })
      .expect(401);

    expect(response.body.code).toBe('INVALID_PASSWORD');
  });

  it('DELETE /api/users removes current user account', async () => {
    await request(app)
      .delete('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deleted = await User.findById(userId);
    expect(deleted).toBeNull();
  });

  it('PUT/DELETE favorites and seen mutate user collections', async () => {
    await request(app)
      .put('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId })
      .expect(200);

    await request(app)
      .put('/api/users/seen')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId })
      .expect(200);

    let user = await User.findById(userId);
    expect(user?.favorites).toContain(movieId);
    expect(user?.seen).toContain(movieId);

    await request(app)
      .delete('/api/users/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId })
      .expect(200);

    await request(app)
      .delete('/api/users/seen')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId })
      .expect(200);

    user = await User.findById(userId);
    expect(user?.favorites).not.toContain(movieId);
    expect(user?.seen).not.toContain(movieId);
  });

  it('PUT/DELETE watchlist updates collection', async () => {
    await request(app)
      .put('/api/users/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId })
      .expect(200);

    let user = await User.findById(userId);
    expect(user?.watchlist).toContain(movieId);

    await request(app)
      .delete('/api/users/watchlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId })
      .expect(200);

    user = await User.findById(userId);
    expect(user?.watchlist).not.toContain(movieId);
  });

  it('PUT/DELETE /api/users/rate adds and removes ratings', async () => {
    await request(app)
      .put('/api/users/rate')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId, rating: 4 })
      .expect(200);

    let user = await User.findById(userId);
    expect(user?.ratings).toHaveLength(1);

    await request(app)
      .delete('/api/users/rate')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: movieId })
      .expect(200);

    user = await User.findById(userId);
    expect(user?.ratings).toHaveLength(0);
  });

  it('GET /api/users/reviews returns current user review list', async () => {
    await Review.create({
      userId,
      movieId,
      text: 'My review text',
      rating: 5,
      isSpoiler: false,
      likes: [],
    });

    const response = await request(app)
      .get('/api/users/reviews')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].text).toBe('My review text');
    expect(response.body[0].movieTitle).toBe('User Test Movie');
  });
});