import { loginDtoSchema } from '@/auth';
import { movieSchema } from '@/movies';
import { createQuoteDtoSchema } from '@/quotes';
import { createReviewDtoSchema } from '@/reviews';
import { createUserDtoSchema, updateUserDtoSchema } from '@/users';

describe('Schema validation', () => {
  it('validates create user payload', () => {
    const result = createUserDtoSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak password in create user payload', () => {
    const result = createUserDtoSchema.safeParse({
      name: 'User',
      email: 'user@example.com',
      password: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('validates login payload', () => {
    const result = loginDtoSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('validates partial update payload', () => {
    const result = updateUserDtoSchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('validates minimal movie payload', () => {
    const result = movieSchema.safeParse({
      title: 'Movie',
      director: 'Director',
      description: 'Description',
      date: '2024',
      runtime: '120 min',
      rating: 'PG-13',
      img: 'https://example.com/movie.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects quote payload with empty quote', () => {
    const result = createQuoteDtoSchema.safeParse({ quote: '', subquote: 'Sub' });
    expect(result.success).toBe(false);
  });

  it('validates review payload', () => {
    const result = createReviewDtoSchema.safeParse({
      movieId: '507f1f77bcf86cd799439011',
      text: 'Great movie',
      rating: 4,
      isSpoiler: false,
    });
    expect(result.success).toBe(true);
  });
});