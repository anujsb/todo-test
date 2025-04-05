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

  if (error) return <div className="text-red-500">Failed to load tasks</div>;
  if (!data) return <div className="text-gray-500">Loading...</div>;

  const tasks = z.array(taskSchema).parse(data);

  const handleDelete = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    mutate();
  };

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">{task.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{task.description || 'No description'}</p>
            <p className="text-sm text-gray-500">
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </p>
            <p className="text-sm text-gray-500">
              Duration: {task.duration ? `${task.duration} minutes` : 'Not specified'}
            </p>
            <p className="text-sm text-gray-500">Status: {task.status}</p>
            <div className="flex space-x-2 mt-4">
              <TaskEditForm task={task} />
              <Button
                variant="destructive"
                onClick={() => handleDelete(task.id)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </ul>
  );
}