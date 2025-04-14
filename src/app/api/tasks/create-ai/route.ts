import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/db';
import { task } from '@/lib/schema';
import { z } from 'zod';

// Schema for task insertion
const insertTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  duration: z.number().nullable().optional(), // Allow null values
  status: z.enum(['pending', 'in_progress', 'completed']).optional().default('pending'),
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const existingTasks = await db.select().from(task);
    const context = existingTasks.map((task) => ({
      title: task.title,
      dueDate: task.dueDate?.toISOString(),
      duration: task.duration,
      status: task.status,
    }));

    const prompt = `
      Given the user input: "${text}"
      And the existing tasks in the database: ${JSON.stringify(context, null, 2)}
      Analyze the current situation and prioritize the task assignment based on the following factors:
      - Priority: If the task is marked as high priority, it should be scheduled as soon as possible.
      - Availability: Consider the availability of time slots based on the due dates and durations of existing tasks.
      - Context: Ensure the task does not overlap with existing tasks and fits logically into the schedule.
      - Duration: Estimate the duration of the task based on its complexity. If not specified, default to 60 minutes, but adjust based on the task's nature and priority.
      - Due Date: If the user specifies a relative date like "tomorrow" or "next week", calculate the exact date based on today's date (${new Date().toISOString().split('T')[0]}). If no date is specified, suggest the nearest available date based on the database context or default to tomorrow.
      - Location: If the task requires a specific location or resource, ensure it is assigned accordingly.

      Extract the following task attributes:
      - title: A short title for the task.
      - description: A detailed description of the task (optional, default to "No description provided" if not specified).
      - dueDate: The due date in ISO 8601 format (optional). If no date is specified, infer the most logical date based on priority and availability.
      - duration: The estimated duration of the task in minutes (optional, default to 60 minutes if not specified, but adjust based on priority and complexity).
      - status: The status of the task, which can be one of the following: "pending", "in_progress", or "completed" (default to "pending" if not specified).

      Return the result as a valid JSON object with the following structure:
      {
        "title": "string",
        "description": "string or null",
        "dueDate": "string (ISO 8601) or null",
        "duration": "number or null",
        "status": "pending | in_progress | completed"
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = await result.response.text();

    // Sanitize the response to remove Markdown-like formatting
    responseText = responseText.replace(/```json|```/g, '').trim();

    const taskData = JSON.parse(responseText);

    const validatedData = insertTaskSchema.parse({
      title: taskData.title,
      description: taskData.description || 'No description provided', // Default description
      dueDate: taskData.dueDate
        ? validateDueDate(new Date(taskData.dueDate)) // Validate and adjust the dueDate
        : suggestDueDate(context.map((task) => ({ dueDate: task.dueDate ?? null }))), // Infer dueDate if not provided
      duration: taskData.duration ?? 60, // Default duration to 60 minutes if not provided
      status: taskData.status || 'pending', // Default status to 'pending'
    });

    const newTask = await db.insert(task).values(validatedData).returning();
    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error('Error processing AI task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Function to suggest a due date based on the context
function suggestDueDate(context: Array<{ dueDate: string | null }>): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the start of the day

  const futureDates = context
    .map((task) => (task.dueDate ? new Date(task.dueDate) : null))
    .filter((date): date is Date => date !== null && date >= today); // Ensure only future or today's dates are considered

  // Suggest the nearest future date or default to tomorrow
  return futureDates.length > 0
    ? futureDates.sort((a, b) => a.getTime() - b.getTime())[0]
    : new Date(today.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
}

// Function to validate and adjust the due date
function validateDueDate(dueDate: Date): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the start of the day

  if (dueDate < today) {
    // If the due date is in the past, default to tomorrow
    return new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }

  return dueDate; // Return the valid due date
}