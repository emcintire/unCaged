import bcrypt from 'bcrypt';
import request from 'supertest';

import { Issue } from '@/issues';
import { User } from '@/users';
import { signAccessToken } from '@/utils';

import app from '../app/app';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
  }),
}));

describe('Issues API', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    await Promise.all([Issue.deleteMany({}), User.deleteMany({})]);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin-issues@example.com',
      password: await bcrypt.hash('AdminPass123', 10),
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    const user = await User.create({
      name: 'Reporter',
      email: 'reporter@example.com',
      password: await bcrypt.hash('UserPass123', 10),
      isAdmin: false,
      img: 'https://i.imgur.com/9NYgErP.png',
    });

    adminToken = signAccessToken({ sub: admin._id.toString(), isAdmin: true });
    userToken = signAccessToken({ sub: user._id.toString(), isAdmin: false });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await Promise.all([Issue.deleteMany({}), User.deleteMany({})]);
  });

  it('POST /api/issues creates an issue and returns 201', async () => {
    await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'bug', title: 'Something broke', description: 'It broke on startup' })
      .expect(201);

    const issue = await Issue.findOne({ title: 'Something broke' });
    expect(issue).not.toBeNull();
    expect(issue?.userId).toBe(userId);
    expect(issue?.userEmail).toBe('reporter@example.com');
    expect(issue?.status).toBe('open');
  });

  it('POST /api/issues requires authentication', async () => {
    await request(app)
      .post('/api/issues')
      .send({ type: 'bug', title: 'No auth', description: 'Should fail' })
      .expect(401);
  });

  it('POST /api/issues validates the payload', async () => {
    await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'invalid_type', title: 'Bad type', description: 'desc' })
      .expect(400);

    await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'bug', title: '', description: 'desc' })
      .expect(400);

    await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'bug', title: 'Missing description' })
      .expect(400);
  });

  it('GET /api/issues requires admin', async () => {
    await request(app)
      .get('/api/issues')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    const response = await request(app)
      .get('/api/issues')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('issues');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('hasMore');
  });

  it('GET /api/issues filters by status', async () => {
    await Issue.create([
      { userId, userEmail: 'reporter@example.com', userName: 'Reporter', type: 'bug', title: 'Open issue', description: 'desc', status: 'open' },
      { userId, userEmail: 'reporter@example.com', userName: 'Reporter', type: 'feature', title: 'Resolved issue', description: 'desc', status: 'resolved' },
    ]);

    const openRes = await request(app)
      .get('/api/issues?status=open')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(openRes.body.issues).toHaveLength(1);
    expect(openRes.body.issues[0].status).toBe('open');

    const resolvedRes = await request(app)
      .get('/api/issues?status=resolved')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(resolvedRes.body.issues).toHaveLength(1);
    expect(resolvedRes.body.issues[0].status).toBe('resolved');
  });

  it('PATCH /api/issues/:id/resolve marks issue as resolved', async () => {
    const issue = await Issue.create({
      userId,
      userEmail: 'reporter@example.com',
      userName: 'Reporter',
      type: 'bug',
      title: 'Resolve me',
      description: 'desc',
      status: 'open',
    });

    const response = await request(app)
      .patch(`/api/issues/${issue._id.toString()}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.status).toBe('resolved');

    const updated = await Issue.findById(issue._id);
    expect(updated?.status).toBe('resolved');
  });

  it('PATCH /api/issues/:id/resolve requires admin', async () => {
    const issue = await Issue.create({
      userId,
      userEmail: 'reporter@example.com',
      userName: 'Reporter',
      type: 'bug',
      title: 'Admin only',
      description: 'desc',
    });

    await request(app)
      .patch(`/api/issues/${issue._id.toString()}/resolve`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('PATCH /api/issues/:id/resolve returns 404 for unknown issue', async () => {
    await request(app)
      .patch('/api/issues/507f1f77bcf86cd799439011/resolve')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('DELETE /api/issues/:id removes the issue', async () => {
    const issue = await Issue.create({
      userId,
      userEmail: 'reporter@example.com',
      userName: 'Reporter',
      type: 'other',
      title: 'Delete me',
      description: 'desc',
    });

    await request(app)
      .delete(`/api/issues/${issue._id.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const deleted = await Issue.findById(issue._id);
    expect(deleted).toBeNull();
  });

  it('DELETE /api/issues/:id requires admin', async () => {
    const issue = await Issue.create({
      userId,
      userEmail: 'reporter@example.com',
      userName: 'Reporter',
      type: 'other',
      title: 'Protected',
      description: 'desc',
    });

    await request(app)
      .delete(`/api/issues/${issue._id.toString()}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('DELETE /api/issues/:id returns 404 for unknown issue', async () => {
    await request(app)
      .delete('/api/issues/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
