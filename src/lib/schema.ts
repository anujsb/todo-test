import { pgTable, serial, text, timestamp, integer, pgEnum, date } from 'drizzle-orm/pg-core';

export const status = pgEnum("status", ['pending', 'in_progress', 'completed']);
export const task = pgTable("task", {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    dueDate: timestamp('due_date'),
    duration: integer('duration'), // in minutes
    status: status('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),

});

