import { movieSchema } from '@/movies';
import { quoteSchema } from '@/quotes';
import { newUserSchema, loginSchema, updateUserSchema } from '@/users';

describe('Zod Schema Type Safety Tests', () => {
  describe('User Registration Schema Validation', () => {
    it('should validate correct user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1',
      };

      const result = newUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
        expect(typeof result.data.password).toBe('string');
      }
    });

    it('should reject user with invalid email', () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'SecurePass1',
      };

      const result = newUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject user with weak password', () => {
      const weakPassword = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
      };

      const result = newUserSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Password');
      }
    });

    it('should reject password without uppercase', () => {
      const noUppercase = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'lowercase1',
      };

      const result = newUserSchema.safeParse(noUppercase);
      expect(result.success).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const noLowercase = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'UPPERCASE1',
      };

      const result = newUserSchema.safeParse(noLowercase);
      expect(result.success).toBe(false);
    });

    it('should reject password without digit', () => {
      const noDigit = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'NoDigitPassword',
      };

      const result = newUserSchema.safeParse(noDigit);
      expect(result.success).toBe(false);
    });

    it('should reject name that is too long', () => {
      const longName = {
        name: 'a'.repeat(101),
        email: 'john@example.com',
        password: 'SecurePass1',
      };

      const result = newUserSchema.safeParse(longName);
      expect(result.success).toBe(false);
    });

    it('should accept registration without name (name is optional)', () => {
      const noName = {
        email: 'john@example.com',
        password: 'SecurePass1',
      };

      const result = newUserSchema.safeParse(noName);
      expect(result.success).toBe(true);
    });
  });

  describe('Login Schema Validation', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'ValidPass1',
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject login with missing fields', () => {
      const missingPassword = {
        email: 'user@example.com',
      };

      const result = loginSchema.safeParse(missingPassword);
      expect(result.success).toBe(false);
    });

    it('should provide type-safe data after validation', () => {
      const loginData = {
        email: 'typed@example.com',
        password: 'TypeSafe1',
      };

      const result = loginSchema.safeParse(loginData);
      if (result.success) {
        // TypeScript should know these properties exist
        const email: string = result.data.email;
        const password: string = result.data.password;
        expect(email).toBe('typed@example.com');
        expect(password).toBe('TypeSafe1');
      }
    });
  });

  describe('Update Schema Validation', () => {
    it('should validate partial update data', () => {
      const partialUpdate = {
        name: 'New Name',
      };

      const result = updateUserSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should accept empty update object', () => {
      const emptyUpdate = {};

      const result = updateUserSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate multiple optional fields', () => {
      const multipleFields = {
        name: 'Updated Name',
        email: 'updated@example.com',
        img: 'https://example.com/img.png',
      };

      const result = updateUserSchema.safeParse(multipleFields);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe('Updated Name');
        expect(result.data.email).toBe('updated@example.com');
        expect(result.data.img).toBe('https://example.com/img.png');
      }
    });

    it('should reject invalid email in update', () => {
      const invalidEmail = {
        email: 'not-valid',
      };

      const result = updateUserSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('Movie Schema Validation', () => {
    it('should validate complete movie data', () => {
      const validMovie = {
        title: 'Great Movie',
        director: 'Famous Director',
        description: 'An amazing film',
        date: '2023',
        runtime: '120 min',
        rating: 'PG-13',
        img: 'https://example.com/poster.jpg',
        genres: ['Action', 'Drama'],
      };

      const result = movieSchema.safeParse(validMovie);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBe('Great Movie');
        expect(result.data.genres).toHaveLength(2);
        expect(Array.isArray(result.data.genres)).toBe(true);
      }
    });

    it('should validate minimal movie data', () => {
      const minimalMovie = {
        title: 'Minimal Movie',
        director: 'Director',
        date: '2023',
        runtime: '90 min',
        rating: 'G',
      };

      const result = movieSchema.safeParse(minimalMovie);
      expect(result.success).toBe(true);
    });

    it('should reject movie with missing required fields', () => {
      const incompleteMovie = {
        title: 'Incomplete Movie',
        director: 'Director',
        // missing date, runtime, rating
      };

      const result = movieSchema.safeParse(incompleteMovie);
      expect(result.success).toBe(false);
    });

    it('should reject title that is too long', () => {
      const longTitle = {
        title: 'a'.repeat(101),
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      const result = movieSchema.safeParse(longTitle);
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const emptyTitle = {
        title: '',
        director: 'Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
      };

      const result = movieSchema.safeParse(emptyTitle);
      expect(result.success).toBe(false);
    });

    it('should type-check movie with genres array', () => {
      const movieWithGenres = {
        title: 'Genre Movie',
        director: 'Director',
        date: '2023',
        runtime: '110 min',
        rating: 'R',
        genres: ['Thriller', 'Mystery', 'Crime'],
      };

      const result = movieSchema.safeParse(movieWithGenres);
      if (result.success) {
        const genres = result.data.genres;
        expect(Array.isArray(genres)).toBe(true);
        if (genres) {
          genres.forEach((genre) => {
            expect(typeof genre).toBe('string');
          });
        }
      }
    });
  });

  describe('Quote Schema Validation', () => {
    it('should validate correct quote data', () => {
      const validQuote = {
        quote: 'This is a great quote',
        subquote: 'From a great movie',
      };

      const result = quoteSchema.safeParse(validQuote);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.quote).toBe('This is a great quote');
        expect(result.data.subquote).toBe('From a great movie');
      }
    });

    it('should reject quote that is too long', () => {
      const longQuote = {
        quote: 'a'.repeat(256),
        subquote: 'Source',
      };

      const result = quoteSchema.safeParse(longQuote);
      expect(result.success).toBe(false);
    });

    it('should reject empty quote', () => {
      const emptyQuote = {
        quote: '',
        subquote: 'Source',
      };

      const result = quoteSchema.safeParse(emptyQuote);
      expect(result.success).toBe(false);
    });
  });

  describe('Type Inference Tests', () => {
    it('should infer correct TypeScript types from schemas', () => {
      const userData = {
        name: 'Type Test',
        email: 'type@test.com',
        password: 'TypePass1',
      };

      const result = newUserSchema.safeParse(userData);
      if (result.success) {
        // These should all be type-safe
        const name: string | undefined = result.data.name;
        const email: string = result.data.email;
        const password: string = result.data.password;

        expect(typeof name).toBe('string');
        expect(typeof email).toBe('string');
        expect(typeof password).toBe('string');
      }
    });

    it('should maintain type safety across validation', () => {
      const movieData = {
        title: 'Type Safe Movie',
        director: 'Type Director',
        date: '2023',
        runtime: '100 min',
        rating: 'PG',
        genres: ['Action', 'Comedy'],
      };

      const result = movieSchema.safeParse(movieData);
      if (result.success) {
        expect(typeof result.data.title).toBe('string');
        expect(typeof result.data.director).toBe('string');
        expect(Array.isArray(result.data.genres)).toBe(true);
      }
    });
  });

  describe('Error Message Tests', () => {
    it('should provide clear error messages', () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: 'weak',
      };

      const result = newUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        result.error.issues.forEach((issue: { message: string }) => {
          expect(issue.message).toBeTruthy();
          expect(typeof issue.message).toBe('string');
        });
      }
    });
  });
});
