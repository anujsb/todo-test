import { z } from 'zod';

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  duration: z.number().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  createdAt: z.date(),
  updatedAt: z.date(),
});