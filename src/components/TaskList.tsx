'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { taskSchema } from '@/lib/validations';
import { z } from 'zod';
import TaskEditForm from './TaskEditForm';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TaskList() {
  const { data, error, mutate } = useSWR('/api/tasks', fetcher);

  if (error) return <div>Failed to load tasks</div>;
  if (!data) return <div>Loading...</div>;

  const tasks = z.array(taskSchema).parse(data);

  const handleDelete = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    mutate();
  };

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{task.description || 'No description'}</p>
            <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
            <p>Duration: {task.duration ? `${task.duration} minutes` : 'Not specified'}</p>
            <p>Status: {task.status}</p>
            <div className="flex space-x-2 mt-2">
              <TaskEditForm task={task} />
              <Button variant="destructive" onClick={() => handleDelete(task.id)}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </ul>
  );
}