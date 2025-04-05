'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSWRConfig } from 'swr';
import { taskSchema } from '@/lib/validations';
import { z } from 'zod';

export default function TaskEditForm({ task }: { task: z.infer<typeof taskSchema> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '' // Safely handle string or null
  );
  const [duration, setDuration] = useState(task.duration?.toString() || '');
  const [status, setStatus] = useState(task.status);
  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTask = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null, // Convert back to ISO string or null
      duration: duration ? parseInt(duration) : null,
      status,
    };
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });
    setOpen(false);
    mutate('/api/tasks');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (minutes)" />
          <Select value={status} onValueChange={(value) => setStatus(value as "pending" | "in_progress" | "completed")}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}