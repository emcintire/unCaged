import { z } from 'zod';

export const issueSchema = z.object({
  type: z.enum(['bug', 'feature', 'other']),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2048),
});

export type IssueData = z.infer<typeof issueSchema>;
