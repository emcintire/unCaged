import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import request from 'supertest';
import app from '../app/app';
import { RefreshToken } from '@/auth';
import { User } from '@/users';
import { hashRefreshToken } from '@/utils';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

describe('Auth API', () => {
  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), RefreshToken.deleteMany({})]);
  });

  afterAll(async () => {
    await Promise.all([User.deleteMany({}), RefreshToken.deleteMany({})]);
  });

  it('POST /api/auth/login returns token pair and persists refresh token hash', async () => {
    await User.create({
      name: 'Auth User',
      email: 'auth@example.com',
      password: await bcrypt.hash('Password123', 10),
      isAdmin: false,
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'auth@example.com', password: 'Password123' })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');

    const stored = await RefreshToken.findOne({
      tokenHash: hashRefreshToken(response.body.refreshToken),
    });
    expect(stored).toBeTruthy();
  });

  it('POST /api/auth/login rejects invalid credentials', async () => {
    await User.create({
      name: 'Auth User',
      email: 'auth2@example.com',
      password: await bcrypt.hash('Password123', 10),
      isAdmin: false,
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'auth2@example.com', password: 'WrongPass123' })
      .expect(401);

    expect(response.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/auth/refresh rotates refresh token and revokes old one', async () => {
    await User.create({
      name: 'Refresh User',
      email: 'refresh@example.com',
      password: await bcrypt.hash('Password123', 10),
      isAdmin: false,
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'refresh@example.com', password: 'Password123' })
      .expect(200);

    const oldRefreshToken = login.body.refreshToken as string;
    const oldHash = hashRefreshToken(oldRefreshToken);

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.refreshToken).not.toBe(oldRefreshToken);

    const revoked = await RefreshToken.findOne({ tokenHash: oldHash });
    expect(revoked?.revokedAt).toBeTruthy();
  });

  it('POST /api/auth/refresh rejects missing refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: '' })
      .expect(400);

    expect(response.body.code).toBe('REFRESH_TOKEN_REQUIRED');
  });

  it('POST /api/auth/logout revokes refresh token for authenticated user', async () => {
    await User.create({
      name: 'Logout User',
      email: 'logout@example.com',
      password: await bcrypt.hash('Password123', 10),
      isAdmin: false,
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logout@example.com', password: 'Password123' })
      .expect(200);

    const refreshToken = login.body.refreshToken as string;
    const refreshHash = hashRefreshToken(refreshToken);

    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ refreshToken })
      .expect(200);

    const record = await RefreshToken.findOne({ tokenHash: refreshHash });
    expect(record?.revokedAt).toBeTruthy();
  });

  it('POST /api/auth/forgotPassword stores reset code and expiry', async () => {
    await User.create({
      name: 'Forgot User',
      email: 'forgot@example.com',
      password: await bcrypt.hash('Password123', 10),
      isAdmin: false,
    });

    await request(app)
      .post('/api/auth/forgotPassword')
      .send({ email: 'forgot@example.com' })
      .expect(200);

    const updated = await User.findOne({ email: 'forgot@example.com' });
    expect(updated?.resetCode).toBeTruthy();
    expect(updated?.resetCodeExpiry).toBeTruthy();
    expect((nodemailer.createTransport as jest.Mock)).toHaveBeenCalled();
  });

  it('POST /api/auth/forgotPassword returns 200 for unknown email', async () => {
    await request(app)
      .post('/api/auth/forgotPassword')
      .send({ email: 'unknown@example.com' })
      .expect(200);
  });

  it('POST /api/auth/checkCode validates code and POST /api/auth/resetPassword updates password', async () => {
    const code = '123456';
    const user = await User.create({
      name: 'Reset User',
      email: 'reset@example.com',
      password: await bcrypt.hash('OldPass123', 10),
      resetCode: await bcrypt.hash(code, 10),
      resetCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isAdmin: false,
    });

    await request(app)
      .post('/api/auth/checkCode')
      .send({ email: 'reset@example.com', code })
      .expect(200);

    await request(app)
      .post('/api/auth/resetPassword')
      .send({ email: 'reset@example.com', code, newPassword: 'NewPass123' })
      .expect(200);

    const updated = await User.findById(user._id);
    expect(updated?.resetCode).toBe('');

    const valid = await bcrypt.compare('NewPass123', updated!.password);
    expect(valid).toBe(true);
  });
});