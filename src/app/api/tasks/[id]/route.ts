import { db } from '@/lib/db';
import { task } from '@/lib/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().nullable().transform((val) => (val ? new Date(val) : null)), // Transform string to Date or null
  duration: z.number().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const taskId = parseInt(params.id, 10); // Ensure the ID is parsed as a number
  const tasks = await db.select().from(task).where(eq(task.id, taskId)).limit(1);
  if (tasks.length === 0) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  return NextResponse.json(tasks[0]);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    const updatedTask = await db
      .update(task)
      .set(validatedData)
      .where(eq(task.id, taskId))
      .returning();

    if (updatedTask.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Invalid data", details: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const taskId = parseInt(params.id, 10); // Ensure the ID is parsed as a number
  const deletedTask = await db.delete(task).where(eq(task.id, taskId)).returning();
  if (deletedTask.length === 0) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  return NextResponse.json({ message: 'Task deleted' });
  return NextResponse.json({ message: 'Task deleted' });
}