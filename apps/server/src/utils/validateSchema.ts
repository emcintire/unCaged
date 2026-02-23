import z from 'zod';
import { HttpError } from './httpError';

export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): void => {
  const validation = schema.safeParse(data);
  if (!validation.success) {
    throw new HttpError(400, validation.error.issues[0].message, 'VALIDATION_ERROR', validation.error.issues);
  }
};
