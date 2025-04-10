'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Edit, Trash2, Calendar, Clock, Check, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

interface TaskDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    id: number;
    title: string;
    description: string | null;
    dueDate: string | null;
    duration: number | null;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: Date;
    updatedAt: Date;
  };
  onDelete: () => void;
  onEdit: () => void;
}

export default function TaskDetailsDialog({ 
  isOpen, 
  onClose, 
  task,
  onDelete,
  onEdit 
}: TaskDetailsDialogProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await fetch(`/api/tasks/${task.id}`, {
          method: 'DELETE',
        });
        onDelete();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={18} className="text-green-500" />;
      case 'in_progress':
        return <Clock size={18} className="text-amber-500" />;
      default:
        return <AlertCircle size={18} className="text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-lg border-none shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${
              task.status === 'completed' ? 'bg-green-100' : 
              task.status === 'in_progress' ? 'bg-amber-100' : 
              'bg-blue-100'
            }`}>
              {getStatusIcon(task.status)}
            </div>
            {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <CalendarIcon size={14} />
              Created: {format(task.createdAt, 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {task.dueDate && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar size={14} className="text-gray-400" />
                  Due Date
                </h4>
                <p className="text-gray-800 font-medium">{format(new Date(task.dueDate), 'MMMM d, yyyy')}</p>
              </div>
            )}
            
            {task.duration && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-1">
                  <Clock size={14} className="text-gray-400" />
                  Duration
                </h4>
                <p className="text-gray-800 font-medium">{task.duration} minutes</p>
              </div>
            )}
          </div>
          
          {task.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
              <p className="whitespace-pre-wrap text-gray-800">{task.description}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Last updated: {format(task.updatedAt, 'MMM d, yyyy, h:mm a')}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between border-t pt-4 mt-2">
          <Button 
            variant="outline"
            onClick={handleDelete}
            className="flex items-center border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 size={16} className="mr-2" /> Delete
          </Button>
          <Button 
            onClick={onEdit}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
          >
            <Edit size={16} className="mr-2" /> Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}