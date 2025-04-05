import { db } from '@/lib/db';
import { task } from '@/lib/schema';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const insertTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  duration: z.number().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});


export async function GET() {
    const allTask = await db.select().from(task);
    return NextResponse.json(allTask);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = insertTaskSchema.parse(body);
        const newTask = await db.insert(task).values(validatedData).returning();
        return NextResponse.json(newTask[0], { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
      }

}