import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app/app';
import { Quote, quoteSchema } from '@/quotes';
import { User } from '@/users';

describe('Quote API Endpoints', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);

    const admin = new User({
      name: 'Quote Admin',
      email: 'quoteadmin@example.com',
      password: await bcrypt.hash('AdminPass123', salt),
      isAdmin: true,
      img: 'https://i.imgur.com/9NYgErP.png',
    });
    await admin.save();
    adminToken = admin.generateAuthToken();

    const user = new User({
      name: 'Quote User',
      email: 'quoteuser@example.com',
      password: await bcrypt.hash('UserPass123', salt),
      isAdmin: false,
    });
    await user.save();
    userToken = user.generateAuthToken();
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

      if (Array.isArray(response.body)) {
        expect(response.body[0]?.quote).not.toBe('Old quote');
      } else {
        expect(response.body).toHaveProperty('quote');
      }
    });

    it('should return the most recent quote when multiple exist', async () => {
      await Quote.create({
        quote: 'Older recent quote',
        subquote: 'Sub 1',
        createdOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      });
      await Quote.create({
        quote: 'Newest quote',
        subquote: 'Sub 2',
        createdOn: new Date(),
      });

      const response = await request(app)
        .get('/api/movies/quote')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].quote).toBe('Newest quote');
    });

    it('should not require authentication', async () => {
      await Quote.create({
        quote: 'Public quote',
        subquote: 'Public sub',
        createdOn: new Date(),
      });

      const response = await request(app)
        .get('/api/movies/quote')
        .expect(200);

      expect(response.body).toHaveLength(1);
    });
  });

  describe('POST /api/movies/quote - Create Quote', () => {
    it('should create a new quote with admin token', async () => {
      const response = await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', adminToken)
        .send({ quote: 'New quote', subquote: 'New subquote' })
        .expect(200);

      expect(response.body).toHaveProperty('quote', 'New quote');
      expect(response.body).toHaveProperty('subquote', 'New subquote');
      expect(response.body).toHaveProperty('createdOn');

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

    it('should reject empty quote text', async () => {
      await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', adminToken)
        .send({ quote: '', subquote: 'Sub' })
        .expect(400);
    });

    it('should reject missing subquote', async () => {
      await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', adminToken)
        .send({ quote: 'Quote only' })
        .expect(400);
    });

    it('should reject quote exceeding max length', async () => {
      await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', adminToken)
        .send({ quote: 'a'.repeat(256), subquote: 'Sub' })
        .expect(400);
    });

    it('should reject subquote exceeding max length', async () => {
      await request(app)
        .post('/api/movies/quote')
        .set('x-auth-token', adminToken)
        .send({ quote: 'Valid quote', subquote: 'a'.repeat(129) })
        .expect(400);
    });
  });

  describe('Quote Schema Validation', () => {
    it('should validate correct quote data', () => {
      const result = quoteSchema.safeParse({
        quote: 'A great quote',
        subquote: 'From a great movie',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty quote', () => {
      const result = quoteSchema.safeParse({
        quote: '',
        subquote: 'Source',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty subquote', () => {
      const result = quoteSchema.safeParse({
        quote: 'Valid quote',
        subquote: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject quote that is too long', () => {
      const result = quoteSchema.safeParse({
        quote: 'a'.repeat(256),
        subquote: 'Source',
      });
      expect(result.success).toBe(false);
    });

    it('should reject subquote that is too long', () => {
      const result = quoteSchema.safeParse({
        quote: 'Valid',
        subquote: 'a'.repeat(129),
      });
      expect(result.success).toBe(false);
    });

    it('should accept max length values', () => {
      const result = quoteSchema.safeParse({
        quote: 'a'.repeat(255),
        subquote: 'a'.repeat(128),
      });
      expect(result.success).toBe(true);
    });
  });
});
