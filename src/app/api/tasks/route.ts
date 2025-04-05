import { db } from '@/lib/db';
import { task } from '@/lib/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const insertTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().transform((val) => (val ? new Date(val) : undefined)).optional(), // Transform string to Date
  duration: z.number().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

export async function GET() {
  const allTasks = await db.select().from(task);
  return NextResponse.json(allTasks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming data:', body); // Log incoming data for debugging
    const validatedData = insertTaskSchema.parse(body);
    console.log('Validated data:', validatedData); // Log parsed data for debugging
    const newTask = await db.insert(task).values(validatedData).returning();
    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Invalid data', details: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}