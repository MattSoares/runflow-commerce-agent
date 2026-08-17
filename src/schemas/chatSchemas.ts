import { z } from 'zod';

export const chatSchema = z.object({
  sessionId: z.string().trim().min(1).max(100),
  message: z.string().trim().min(1).max(2000),
}).strict();
