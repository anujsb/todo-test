'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar, Clock, ListChecks, AlignLeft } from 'lucide-react';

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  defaultDate?: Date;
  task?: {
    id: number;
    title: string;
    description: string | null;
    dueDate: string | null;
    duration: number | null;
    status: 'pending' | 'in_progress' | 'completed';
  };
}

export default function TaskFormDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultDate,
  task 
}: TaskFormDialogProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate 
      ? format(new Date(task.dueDate), 'yyyy-MM-dd')
      : defaultDate 
        ? format(defaultDate, 'yyyy-MM-dd') 
        : ''
  );
  const [duration, setDuration] = useState(task?.duration?.toString() || '');
  const [status, setStatus] = useState(task?.status || 'pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const taskData = {
      title,
      description: description || null,
      dueDate: dueDate || null,
      duration: duration ? parseInt(duration, 10) : null,
      status,
    };
  
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
  
      const responseData = await response.json();
      console.log('Response:', responseData); // Log the response for debugging
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create task');
      }
  
      onSave(); // Refresh tasks and close dialog
    } catch (error) {
      console.error('Error saving task:', error);
      if (error instanceof Error) {
        alert(error.message); // Show error to the user
      } else {
        alert('An unknown error occurred'); // Fallback for non-Error types
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-lg border-none shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {task ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-md py-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <AlignLeft size={16} className="text-gray-500 mr-2" />
              <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
            </div>
            <Textarea
              id="description"
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-md resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar size={16} className="text-gray-500 mr-2" />
              <Label htmlFor="dueDate" className="text-gray-700 font-medium">Due Date</Label>
            </div>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Clock size={16} className="text-gray-500 mr-2" />
              <Label htmlFor="duration" className="text-gray-700 font-medium">Duration (minutes)</Label>
            </div>
            <Input
              id="duration"
              type="number"
              min="0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="How long will this task take?"
              className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-md"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <ListChecks size={16} className="text-gray-500 mr-2" />
              <Label htmlFor="status" className="text-gray-700 font-medium">Status</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={status === 'pending' ? 'default' : 'outline'}
                className={`flex-1 ${status === 'pending' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300 text-gray-700'}`}
                onClick={() => setStatus('pending')}
              >
                Pending
              </Button>
              <Button
                type="button"
                variant={status === 'in_progress' ? 'default' : 'outline'}
                className={`flex-1 ${status === 'in_progress' ? 'bg-amber-600 hover:bg-amber-700' : 'border-gray-300 text-gray-700'}`}
                onClick={() => setStatus('in_progress')}
              >
                In Progress
              </Button>
              <Button
                type="button"
                variant={status === 'completed' ? 'default' : 'outline'}
                className={`flex-1 ${status === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'border-gray-300 text-gray-700'}`}
                onClick={() => setStatus('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}