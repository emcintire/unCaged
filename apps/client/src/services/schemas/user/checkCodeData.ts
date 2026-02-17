import { z } from 'zod';

export const CheckCodeDataSchema = z.object({
  code: z.string(),
});

export type CheckCodeData = z.infer<typeof CheckCodeDataSchema>;
