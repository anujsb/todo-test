import { z } from 'zod';

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.string().nullable(), // Match the API schema (string format)
  duration: z.number().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  createdAt: z.string().transform((val) => new Date(val)),
  updatedAt: z.string().transform((val) => new Date(val)),
});