import bcrypt from 'bcrypt';
import request from 'supertest';

import { Quote } from '@/quotes';
import { User } from '@/users';
import { signAccessToken } from '@/utils';

import app from '../app/app';

describe('Quotes API', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    await Promise.all([Quote.deleteMany({}), User.deleteMany({})]);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin-quotes@example.com',
      password: await bcrypt.hash('AdminPass123', 10),
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    const user = await User.create({
      name: 'User',
      email: 'user-quotes@example.com',
      password: await bcrypt.hash('UserPass123', 10),
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    adminToken = signAccessToken({ sub: admin._id.toString(), isAdmin: true });
    userToken = signAccessToken({ sub: user._id.toString(), isAdmin: false });
  });

  afterAll(async () => {
    await Promise.all([Quote.deleteMany({}), User.deleteMany({})]);
  });

  it('GET /api/quotes returns most recent quote when present', async () => {
    await Quote.create({ quote: 'Old', subquote: 'Older', createdOn: new Date('2024-01-01') });
    await Quote.create({ quote: 'Newest', subquote: 'Latest', createdOn: new Date() });

    const response = await request(app).get('/api/quotes').expect(200);
    expect(response.body.quote).toBe('Newest');
    expect(response.body.subquote).toBe('Latest');
  });

  it('GET /api/quotes falls back to static quote when db is empty', async () => {
    const response = await request(app).get('/api/quotes').expect(200);
    expect(response.body).toHaveProperty('quote');
    expect(response.body).toHaveProperty('subquote');
  });

  it('POST /api/quotes allows admin and rejects non-admin/unauthenticated', async () => {
    const payload = { quote: 'Fresh quote', subquote: 'Fresh subquote' };

    await request(app)
      .post('/api/quotes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload)
      .expect(201);

    await request(app)
      .post('/api/quotes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quote: 'User quote', subquote: 'Nope' })
      .expect(403);

    await request(app)
      .post('/api/quotes')
      .send({ quote: 'Anon quote', subquote: 'Nope' })
      .expect(401);
  });

  it('POST /api/quotes validates quote payload', async () => {
    await request(app)
      .post('/api/quotes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quote: '', subquote: 'Valid subquote' })
      .expect(400);

    await request(app)
      .post('/api/quotes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quote: 'Valid quote', subquote: 'a'.repeat(256) })
      .expect(400);
  });
});