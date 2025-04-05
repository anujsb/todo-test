'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState<string | null>(null);
  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      duration: duration ? parseInt(duration, 10) : undefined,
      status,
    };

    if (dueDate && (taskData.dueDate === undefined || isNaN(new Date(taskData.dueDate).getTime()))) {
      setError('Invalid due date');
      return;
    }
    if (duration && (taskData.duration === undefined || isNaN(taskData.duration))) {
      setError('Duration must be a valid number');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      setTitle('');
      setDescription('');
      setDueDate('');
      setDuration('');
      setStatus('pending');
      setError(null);
      mutate('/api/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full"
      />
      <Input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full"
      />
      <Input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Duration (minutes)"
        className="w-full"
      />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
        Add Task
      </Button>
    </form>
  );
}