import bcrypt from 'bcrypt';
import request from 'supertest';

import { Movie } from '@/movies';
import { User } from '@/users';
import { signAccessToken } from '@/utils';

import app from '../app/app';

describe('Movies API', () => {
  let adminToken: string;
  let userToken: string;
  let staffPickId: string;

  beforeEach(async () => {
    await Promise.all([Movie.deleteMany({}), User.deleteMany({})]);

    const adminPassword = await bcrypt.hash('AdminPass123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin-movies@example.com',
      password: adminPassword,
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    const userPassword = await bcrypt.hash('UserPass123', 10);
    const user = await User.create({
      name: 'User',
      email: 'user-movies@example.com',
      password: userPassword,
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    adminToken = signAccessToken({ sub: admin._id.toString(), isAdmin: true });
    userToken = signAccessToken({ sub: user._id.toString(), isAdmin: false });

    const created = await Movie.create([
      {
        title: 'Gamma',
        director: 'Dir C',
        description: 'desc',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
        img: 'https://example.com/gamma.jpg',
        avgRating: 4.6,
      },
      {
        title: 'Alpha',
        director: 'Dir A',
        description: 'desc',
        date: '2021',
        runtime: '100 min',
        rating: 'PG',
        img: 'https://example.com/alpha.jpg',
        avgRating: 2.1,
      },
    ]);

    staffPickId = created[0]._id.toString();
    await User.findByIdAndUpdate(admin._id, { favorites: [staffPickId] });
  });

  afterAll(async () => {
    await Promise.all([Movie.deleteMany({}), User.deleteMany({})]);
  });

  it('GET /api/movies returns movies sorted by title', async () => {
    const response = await request(app).get('/api/movies').expect(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('Alpha');
    expect(response.body[1].title).toBe('Gamma');
  });

  it('GET /api/movies/popular returns max 10 items', async () => {
    const response = await request(app).get('/api/movies/popular').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeLessThanOrEqual(10);
  });

  it('GET /api/movies/staffpicks returns admin favorites', async () => {
    const response = await request(app).get('/api/movies/staffpicks').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]._id).toBe(staffPickId);
  });

  it('GET /api/movies/avgRating/:id returns average', async () => {
    const movie = await Movie.findOne({ title: 'Gamma' });
    const response = await request(app)
      .get(`/api/movies/avgRating/${movie!._id.toString()}`)
      .expect(200);

    expect(response.text).toBe('4.6');
  });

  it('POST /api/movies allows admin and blocks non-admin', async () => {
    const payload = {
      title: 'New Movie',
      director: 'Director',
      description: 'A movie',
      date: '2024',
      runtime: '110 min',
      rating: 'R',
      img: 'https://example.com/new.jpg',
    };

    await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload)
      .expect(201);

    await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...payload, title: 'User Cannot Create' })
      .expect(403);
  });
});